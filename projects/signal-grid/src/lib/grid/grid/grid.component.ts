import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  Type
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Model } from '../models/model';
import { ColumnConfiguration, SignalGridFilterFormConfig } from '../models/models';
import { ColumnSchema, compileColumns } from '../models/column-schema';
import { RowComponent } from '../row/row.component';
import { GridStore } from '../services/grid-store';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'signal-grid',
  standalone: true,
  imports: [
    RowComponent,
    ScrollingModule,
    ReactiveFormsModule,
    FormlyModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: 'grid.component.html',
  styleUrls: ['grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GridStore]
})
export class GridComponent {
  model = input.required<Model[]>();
  /**
   * Columns: plain {@link ColumnSchema} objects and/or built
   * `ColumnConfiguration`s. Schemas compile once per `columns` change (in the
   * transform, before any row renders) and the resulting field set + validators
   * are applied to the store.
   */
  columns = input.required<ColumnConfiguration[], (ColumnSchema | ColumnConfiguration)[]>({
    transform: value => {
      const compiled = compileColumns(value);
      this.store.setColumns(compiled);
      return compiled;
    }
  });
  includeRowExpander = input(false);
  modelChange = output<Model[]>();
  saveChanges = output<Model[]>();
  resetChanges = output<void>();
  filterFormConfig = input<SignalGridFilterFormConfig | null>(null);
  filterSubmit = output<Record<string, unknown>>();
  editable = input(true);
  rowExpanderConfig = input<Type<unknown>>(null);

  /** Per-grid edit state: viewport-scoped row forms + sparse identity-keyed edits. */
  private readonly store = inject(GridStore);

  private readonly _columnWidths = signal<Record<string, number>>({});

  hasUnsavedChanges = computed(() => this.store.hasEdits());
  isFormValid = computed(() => {
    if (!this.editable()) {
      return true;
    }
    return this.store.invalidCount() === 0;
  });

  isExpanded = signal<Record<number, boolean>>({});

  gridTemplateColumns = computed(
    () => {
      const parts: string[] = [];
      for (const col of this.columns()) {
        const w = this._columnWidths()[col.fieldName] ?? col.getWidth?.() ?? col.width ?? 120;
        parts.push(`${w}px`);
      }
      if (this.showRowExpander()) {
        parts.push(`${this.expanderColWidth()}px`);
      }
      return parts.join(' ');
    },
    { equal: (a, b) => a === b }
  );

  columnWidthMap = computed(
    () => {
      const map: Record<string, string> = {};
      for (const col of this.columns()) {
        const w = this._columnWidths()[col.fieldName] ?? col.getWidth?.() ?? col.width ?? 120;
        map[col.fieldName] = `${w}px`;
      }
      return map;
    },
    {
      equal: (a, b) => {
        const aKeys = Object.keys(a);
        return (
          aKeys.length === Object.keys(b).length && aKeys.every(key => a[key] === b[key])
        );
      }
    }
  );

  hasResizableColumns = computed(() => this.columns().some(c => c.resizable));
  expanderColWidth = computed(() => 40);
  showRowExpander = computed(() => this.includeRowExpander() || !!this.rowExpanderConfig());

  filterFormGroup = new FormGroup({});
  filterModel: Record<string, unknown> = {};

  /** Stable across filter/sort — row keys derive from row object identity. */
  trackByKey = (_index: number, row: Model) => this.store.keyFor(row);

  constructor() {
    // Debounced propagation of edits: the store bumps `changes` on every cell
    // value change; after 250 ms of quiet we emit the merged model — but only
    // when there is actually something to report. `hasEdits()`, `model()` and
    // `mergedModel()` are read inside the timeout, i.e. untracked: always the
    // current values. The first (initial) run finds no edits and emits nothing.
    effect(onCleanup => {
      this.store.changes();
      const timer = setTimeout(() => {
        if (this.store.hasEdits()) {
          this.modelChange.emit(this.store.mergedModel(this.model()));
        }
      }, 250);
      onCleanup(() => clearTimeout(timer));
    });
  }

  /** Mouse-down on a resize handle: sets up drag listeners. */
  resizeColumn(fieldName: string, widthPx: number): void {
    this._columnWidths.update(current => ({ ...current, [fieldName]: Math.max(30, widthPx) }));
  }

  startResize(payload: { event: MouseEvent; column: ColumnConfiguration }): void {
    const event = payload.event;
    const column = payload.column;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth =
      this._columnWidths()[column.fieldName] ?? column.getWidth?.() ?? column.width ?? 120;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      this.resizeColumn(column.fieldName, startWidth + diff);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onRowExpanderChange(index: number, expanded: boolean): void {
    this.isExpanded.update(m => ({ ...m, [index]: expanded }));
  }

  save(): void {
    const merged = this.store.mergedModel(this.model());
    this.store.commit();
    this.saveChanges.emit(merged);
  }

  reset(): void {
    this.store.reset();
    this.resetChanges.emit();
  }

  onFilterSubmit(): void {
    this.filterSubmit.emit(this.filterFormGroup.getRawValue());
  }

  onFilterReset(): void {
    this.filterModel = {};
    this.filterFormGroup.reset();
    this.filterSubmit.emit(this.filterModel);
  }
}
