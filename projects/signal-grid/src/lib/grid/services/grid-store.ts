import { computed, Injectable, signal, Signal } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Model } from '../models/model';
import { CellAction, ColumnConfiguration } from '../models/models';

interface RowState {
  version: number;
  dirty: boolean;
  valid: boolean;
}

interface AttachedRow {
  group: FormGroup;
  row: Model;
  valueSub: { unsubscribe(): void };
  statusSub: { unsubscribe(): void };
}

interface FieldDef {
  name: string;
  validators: ValidatorFn[] | null;
}

/**
 * Per-grid edit state and form storage.
 *
 * Design goals (see SIGNAL-GRID-REVIEW.md):
 * - **Cost independent of row count.** Form groups exist only for rows that are
 *   currently rendered (plus whatever the viewport has touched), never for the
 *   whole model. Scrolling releases groups; only sparse *edits* persist.
 * - **Rows are identified by object identity, not index.** Filtering and
 *   sorting keep unsaved edits attached to the right rows.
 * - **One change subscription per attached row** (in this class) instead of per
 *   cell. Cells read state through signals (`group()`, `version()`, `dirty()`).
 *
 * Provided on `GridComponent`; rows and cells reach it through the element
 * injector chain.
 */
@Injectable()
export class GridStore {
  // ---- column configuration (field set + validators), set from the grid's `columns` transform
  private fieldDefs: FieldDef[] = [];

  // ---- reactive state
  private readonly _epoch = signal(0);
  private readonly _state = signal(new Map<string, RowState>());
  private readonly _editsTick = signal(0);
  private readonly _changes = signal(0);
  private readonly _actions = new Subject<CellAction>();

  /**
   * Action clicks from the built-in `actions` cell (and custom cells). The grid
   * subscribes once and re-emits them through its `cellAction` output; the row
   * object is attached here so consumers get the actual data row.
   */
  get actions(): Observable<CellAction> {
    return this._actions.asObservable();
  }

  dispatchAction(action: CellAction): void {
    const attached = this.attached.get(action.rowKey);
    this._actions.next({ ...action, row: attached?.row ?? action.row });
  }


  // ---- storage
  private readonly attached = new Map<string, AttachedRow>();
  private readonly edits = new Map<string, Map<string, unknown>>();
  private readonly keys = new WeakMap<object, string>();
  private keySeq = 0;

  private readonly groupCache = new Map<string, Signal<FormGroup | null>>();
  private readonly versionCache = new Map<string, Signal<number>>();
  private readonly dirtyCache = new Map<string, Signal<boolean>>();

  /**
   * Bumps whenever any cell value changes. The grid subscribes (debounced) and
   * emits `modelChange`.
   */
  get changes(): Signal<number> {
    return this._changes;
  }

  // ---------------------------------------------------------------- identity

  /** Stable identity key for a row object. O(1); keys die with their rows. */
  keyFor(row: Model): string {
    if (row == null || typeof row !== 'object') {
      // Primitive rows have no identity; fall back to a value-keyed entry.
      return `v:${String(row)}`;
    }
    let key = this.keys.get(row);
    if (!key) {
      key = `r${++this.keySeq}`;
      this.keys.set(row, key);
    }
    return key;
  }

  // ---------------------------------------------------------------- config

  /**
   * Applies the compiled column set: derives the unique field list and any
   * validators, then rebuilds attached groups (their shape may have changed).
   * Called from `GridComponent`'s `columns` input transform, so it always runs
   * before rows render.
   */
  setColumns(columns: ColumnConfiguration[]): void {
    const byField = new Map<string, ValidatorFn[]>();
    for (const column of columns) {
      if (!column?.fieldName) {
        continue;
      }
      const list = byField.get(column.fieldName) ?? [];
      if (column.validators) {
        list.push(...(Array.isArray(column.validators) ? column.validators : [column.validators]));
      }
      byField.set(column.fieldName, list);
    }
    this.fieldDefs = [...byField].map(([name, validators]) => ({
      name,
      validators: validators.length ? validators : null
    }));
    this.destroyAttached();
    this._epoch.update(v => v + 1);
  }

  /** Reactive epoch — bumped when the field set changes or state is reset. */
  epoch(): number {
    return this._epoch();
  }

  // ---------------------------------------------------------------- rows

  /**
   * Returns the form group for a rendered row, creating it on first access
   * from the row's data plus any recorded edits. Idempotent.
   */
  ensureRow(key: string, row: Model): FormGroup | null {
    if (!key || !row) {
      return null;
    }
    const existing = this.attached.get(key);
    if (existing) {
      return existing.group;
    }
    const controls: Record<string, FormControl> = {};
    for (const def of this.fieldDefs) {
      const editEntry = this.edits.get(key);
      const initial = editEntry?.has(def.name) ? editEntry.get(def.name) : row[def.name];
      controls[def.name] = new FormControl(initial, def.validators);
    }
    const group = new FormGroup(controls);
    const attached: AttachedRow = {
      group,
      row,
      valueSub: null,
      statusSub: null
    };
    attached.valueSub = group.valueChanges.subscribe(() => this.onRowValueChanged(key));
    attached.statusSub = group.statusChanges.subscribe(() => this.onRowStatusChanged(key));
    this.attached.set(key, attached);
    // Seed per-row state WITHOUT writing the signal: this code runs inside the
    // row's `group` computed, and Angular forbids signal writes in computeds
    // (NG0600). Mutating the current map is visible to every reader on its next
    // re-run; the epoch/state bumps elsewhere provide the notifications that
    // matter (first render reads fresh anyway — cells are created after the
    // row's group exists).
    const seed = this._state();
    if (!seed.has(key)) {
      seed.set(key, {
        version: 0,
        dirty: this.edits.has(key),
        valid: group.valid
      });
    }
    return group;
  }

  /**
   * Releases a row's group when it leaves the viewport. Edits and their last
   * known dirty/valid state survive; the controls are rebuilt on re-attach.
   */
  release(key: string): void {
    if (!key) {
      return;
    }
    const attached = this.attached.get(key);
    if (attached) {
      attached.valueSub.unsubscribe();
      attached.statusSub.unsubscribe();
      this.attached.delete(key);
    }
    const state = new Map(this._state());
    if (this.edits.has(key)) {
      const prev = state.get(key);
      state.set(key, { version: (prev?.version ?? 0) + 1, dirty: true, valid: prev?.valid ?? true });
    } else {
      state.delete(key);
    }
    this._state.set(state);
    this.groupCache.delete(key);
    this.versionCache.delete(key);
    this.dirtyCache.delete(key);
  }

  /** Reactive accessors, stable per row key. */
  group(key: string): Signal<FormGroup | null> {
    let cached = this.groupCache.get(key);
    if (!cached) {
      cached = computed(() => {
        this._state();
        this._epoch();
        return this.attached.get(key)?.group ?? null;
      });
      this.groupCache.set(key, cached);
    }
    return cached;
  }

  version(key: string): Signal<number> {
    let cached = this.versionCache.get(key);
    if (!cached) {
      cached = computed(() => this._state().get(key)?.version ?? 0);
      this.versionCache.set(key, cached);
    }
    return cached;
  }

  dirty(key: string): Signal<boolean> {
    let cached = this.dirtyCache.get(key);
    if (!cached) {
      cached = computed(() => this._state().get(key)?.dirty ?? false);
      this.dirtyCache.set(key, cached);
    }
    return cached;
  }

  // ---------------------------------------------------------------- aggregate state

  /** Number of rows with unsaved edits (survives rows leaving the viewport). */
  dirtyRowCount = computed(() => {
    this._editsTick();
    let count = 0;
    for (const entry of this.edits.values()) {
      if (entry.size) {
        count++;
      }
    }
    return count;
  });

  hasEdits = computed(() => this.dirtyRowCount() > 0);

  /** Invalid rows among currently attached (rendered) rows. */
  invalidCount = computed(() => {
    let count = 0;
    for (const state of this._state().values()) {
      if (!state.valid) {
        count++;
      }
    }
    return count;
  });

  // ---------------------------------------------------------------- edits

  /** The model with all recorded edits applied. Rows without edits pass through. */
  mergedModel(rows: Model[]): Model[] {
    if (!this.edits.size) {
      return rows;
    }
    return rows.map(row => {
      const entry = this.edits.get(this.keyFor(row));
      if (!entry || !entry.size) {
        return row;
      }
      const copy: Record<string, unknown> = { ...row };
      for (const [field, value] of entry) {
        copy[field] = value;
      }
      return copy as Model;
    });
  }

  /** Clears all edits after a save. Attached groups keep their current values. */
  commit(): void {
    this.edits.clear();
    this._editsTick.update(v => v + 1);
    const state = new Map(this._state());
    let changed = false;
    for (const [key, entry] of state) {
      if (entry.dirty) {
        state.set(key, { ...entry, version: entry.version + 1, dirty: false });
        changed = true;
      }
    }
    if (changed) {
      this._state.set(state);
    }
  }

  /** Reverts everything: drops edits and rebuilds attached groups from row data. */
  reset(): void {
    this.edits.clear();
    this._editsTick.update(v => v + 1);
    this.destroyAttached();
    this._state.set(new Map());
    this._epoch.update(v => v + 1);
  }

  // ---------------------------------------------------------------- internals

  private onRowValueChanged(key: string): void {
    const attached = this.attached.get(key);
    if (!attached) {
      return;
    }
    const values = attached.group.value as Record<string, unknown>;
    let entry = this.edits.get(key);
    for (const def of this.fieldDefs) {
      const next = values[def.name];
      const original = attached.row[def.name];
      if (!Object.is(next, original)) {
        if (!entry) {
          entry = new Map();
          this.edits.set(key, entry);
        }
        entry.set(def.name, next);
      } else if (entry?.has(def.name)) {
        entry.delete(def.name);
        if (entry.size === 0) {
          this.edits.delete(key);
          entry = null;
        }
      }
    }
    const dirty = this.edits.has(key);
    const state = new Map(this._state());
    const prev = state.get(key);
    state.set(key, {
      version: (prev?.version ?? 0) + 1,
      dirty,
      valid: attached.group.valid
    });
    this._state.set(state);
    this._editsTick.update(v => v + 1);
    this._changes.update(v => v + 1);
  }

  private onRowStatusChanged(key: string): void {
    const attached = this.attached.get(key);
    if (!attached) {
      return;
    }
    const state = new Map(this._state());
    const prev = state.get(key);
    if (prev && prev.valid === attached.group.valid) {
      return;
    }
    state.set(key, {
      version: (prev?.version ?? 0) + 1,
      dirty: prev?.dirty ?? this.edits.has(key),
      valid: attached.group.valid
    });
    this._state.set(state);
  }

  private destroyAttached(): void {
    for (const attached of this.attached.values()) {
      attached.valueSub.unsubscribe();
      attached.statusSub.unsubscribe();
    }
    this.attached.clear();
  }
}
