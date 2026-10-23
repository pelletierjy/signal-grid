# signal-grid — Performance & Architecture Review

Reviewed: library (`projects/signal-grid/src/lib/grid/…`) and site (`src/app/…`),
including the staged (uncommitted) changes vs. the last commits.

---

## 1. TL;DR

| Problem | Root cause | Fix level |
|---|---|---|
| **Page never loads** | Infinite effect loop: an effect **reads `_formGroup()` and then writes `_formGroup.set(new FormGroup)`**. New object ≠ old every run → effect re-runs forever inside one scheduler flush → main thread never yields → blank page. | P0 (5 min) |
| **Filtered grid shows wrong/stale rows** | `_buildFormGroup(…, prevFg)` prefers **all** previous form values over fresh row data (`prevValues[field] ?? row[field]`). `getRawValue()` returns every value, not just edited ones — so after any model change, each index keeps showing whatever row *used to* sit there. | P0 |
| **Slow at 1,000+ rows** | Eager giant form: **1,000 rows × 5 fields = 5,000 `FormControl`s** built up front, rebuilt wholesale on every model change, two change subscriptions per cell, inputs re-applied per CD pass, full-model emission per keystroke. | P1/P2 |
| **Flexibility / "like Formly"** | The registry idea is right, but rendering goes through **3 layers** (Row → Cell wrapper → `NgComponentOutlet` → cell) with 4 input bindings each, and column config is a class with ad-hoc callbacks rather than a schema compiled in one place. | P2 |

**Core insight for the redesign:** *row count must never drive cost.* Only the
~300 visible cells and the sparse set of user edits should exist in memory and
participate in change detection. 1,000 or 100,000 rows should cost the same.

---

## 2. P0 — Why the page doesn't even load

`grid.component.ts`, constructor, second effect (present in the working tree and
introduced by the "Formly filter" commit — the previous version, `HEAD~1`, did
**not** have this pattern, which is why it still ran):

```ts
effect(() => {
  const rows = this.model();
  if (!initialized) return;
  const columns = this.columns();
  const prevFg = this._formGroup();          // ← tracked READ of the signal
  this._formGroup.set(this._buildFormGroup(rows, columns, prevFg)); // ← WRITE of a brand-new object
});
```

Angular effect semantics: an effect re-runs whenever a signal it read changes.
`set()` is called with a **fresh `FormGroup` instance every run**, so the value
always differs → the effect marks itself dirty → re-runs → builds another
5,000 controls → writes again… This happens inside a single scheduler flush, so
the browser never paints. (Documented Angular behavior — see
[angular.dev/effects](https://angular.dev/guide/signals/effect); "if you modify
signals the effect reads inside the effect, it causes an endless loop").

Meanwhile effect #3 (the `valueChanges` subscription) is torn down and
re-subscribed on every cycle, and on first init effect #1 *and* effect #2 both
build the entire form (double cost even if the loop were fixed).

### Fixes (any one of the loop, plus dedupe the init)

```ts
// Option A: read the previous group without tracking it
const prevFg = untracked(() => this._formGroup());

// Option B (clearest): keep the previous group in a closure variable —
// this effect is the only writer, so it already knows what it last wrote.
let lastGroup = new FormGroup({});
effect(() => {
  const rows = this.model();
  const columns = this.columns();
  lastGroup = this._buildFormGroup(rows, columns, lastGroup);
  this._formGroup.set(lastGroup);
  this._isDirty.set(false);
});
// …and delete the separate "initialized" effect — one effect does init + rebuild.
```

`untracked()` import comes from `@angular/core`.

---

## 3. P0 — Correctness bugs found during review

1. **Stale values after filter/save (serious).**
   `_buildFormGroup` carries over *all* previous values by **row index**:
   ```ts
   const prevValues = prevRowGroup ? prevRowGroup.getRawValue() : {};
   new FormControl(prevValues[column.fieldName] ?? row[column.fieldName])
   ```
   `prevValues` always exists for previously occupied indexes → **fresh row data
   is ignored entirely**. After filtering, row *i* displays the values of
   whichever row previously sat at index *i*; user edits migrate to the wrong
   row when rows shift. Fix: carry over **only dirty controls**, keyed by **row
   object identity**, not index:

   ```ts
   // map previous row groups by the row object they belonged to
   const prevByRow = new Map<Model, FormGroup>(
     prevModel.map((r, i) => [r, prevFg.get(String(i)) as FormGroup])
   );
   // per new row:
   const prevGroup = prevByRow.get(row);
   const value = prevGroup?.get(column.fieldName)?.dirty
     ? prevGroup.get(column.fieldName)!.value   // keep user edits
     : row[column.fieldName];                    // otherwise take fresh data
   ```
   (Requires keeping the previous `model()` array in the closure — rows are
   stable objects across filter, so identity matching works.)

2. **Dirty indicator is wrong.** In `row.component.html` the
   `value-indicator` sits *inside* the `@for (column …)` loop → renders **once
   per column** (14× per dirty row), and it reads `formControl()?.pristine`
   which is **not signal-tracked** — under OnPush the row is never marked dirty
   by an edit made inside a cell, so `*` is stale. Move it out of the loop and
   drive it from a row-level version/dirty signal.

3. **`isFormValid` is not reactive.**
   `computed(() => this._formGroup().valid)` — `.valid` is plain state; the
   computed only re-evaluates when the *group instance* changes. Harmless today
   (no validators anywhere) but wrong the moment you add any. Drive it from
   `statusChanges` (mapped to a signal) or from the store.

4. **Missing `MatButtonModule`.** `GridComponent` template uses
   `mat-button color="primary"` but standalone `imports` only lists
   `RowComponent, ScrollingModule, ReactiveFormsModule, FormlyModule,
   CommonModule`. Without `MatButtonModule` the directives silently do nothing —
   Save/Apply/Reset render as plain unstyled buttons.

5. **`distinctUntilChanged()` is dead code.** It runs after
   `map(() => group.getRawValue())`, which produces a new object every time →
   reference equality never holds → never distinct. (Comparing deep objects
   would be worse; see P1 — emit diffs instead.)

6. **`_columnLayout` custom equality** compares only `gridTemplateColumns` but
   returns `{gridTemplateColumns, columnWidthMap}` — `columnWidthMap` can go
   stale if widths ever permute without changing the joined string. Split into
   two computeds or compare both fields.

7. **trackBy by object identity.** `trackByRow = (i, row) => row` is fine for
   filter (rows are stable refs), but the demo's `onSave` replaces rows with
   brand-new raw-value objects → full row re-creation on save. Prefer a stable
   `id` when the model has one.

8. **Full-model emission on every keystroke.** Debounced 250 ms, but still:
   `getRawValue()` over 5,000 controls → array of 1,000 objects → emitted even
   when the consumer just `console.log`s it. `OutputEmitterRef` has no public
   "has listeners" API in Angular 22, so either (a) expose a pull-based
   `getChanges()`/build the merged model in `save()` only, or (b) emit sparse
   patches `{rowKey, field, value}` instead of the whole array.

---

## 4. Why it's slow — ranked perf ledger

Numbers based on the demo: **1,000 rows, 14 columns (5 unique fields —
`Object.fromEntries` keys by `fieldName`, so duplicate-field columns silently
share one control), viewport ≈ 12–20 visible rows.**

| # | Cost | Detail |
|---|---|---|
| 1 | **O(rows × fields) memory + startup** | 5,000 `FormControl`s + 1,000 `FormGroup`s built eagerly, before anything is visible. Each control carries value/validity/status machinery and subscribes to parent groups. |
| 2 | **O(rows × fields) on every filter/save/reset** | The rebuild effect constructs a brand-new 5,000-control tree each time `model()` changes. |
| 3 | **~1,000 effect cycles per rebuild** | A new `FormGroup` instance invalidates `formGroup` input on every rendered row → each cell's `rowGroup`/`formControl` computeds invalidate → **two** effects per cell (`CellComponent` *and* `BaseCellComponent` subscribe to the *same* `control.valueChanges`) unsubscribe/resubscribe. 14 cols × ~15 rows × (2 effects + computeds) per filter. |
| 4 | **Per-CD input churn** | `*ngComponentOutlet="… inputs: { … }"` builds a **new object literal every change-detection pass** → `NgComponentOutlet.ngOnChanges` fires every pass → all 4 inputs re-applied to every cell instance, every pass. |
| 5 | **3 component layers per cell** | Row → `CellComponent` wrapper → outlet → cell type. The wrapper's whole job is type resolution + `cellCssClass`; it adds a component instance, a template, and a copy of `grid.component.scss` (also attached to Row *and* Grid — the same stylesheet ships 3×). |
| 6 | **Callback cascade per value change** | `CallbackParameter` is allocated fresh in a computed → everything downstream (`typeName`, `resolved`, `cssClass`, `isEditable`, `props`) re-runs on every cell value change, per cell. |
| 7 | **Keystroke path** | input event → `valueChanges` bubbles through the 5,000-control tree (validity recomputed up the chain) → debounce → `getRawValue()` (5,000 reads) → new 1,000-element array → emit → `console.log(1,000 rows)`. Zone then runs app-wide CD; the staged demo currently has **OnPush commented out**, so every keystroke checks the whole demo tree. |
| 8 | **Init double-build** | Effect #1 builds the form; effect #2 (now unconditionally past the `initialized` flag) immediately builds it again. |
| 9 | Minor | 14 `value-indicator` divs per dirty row; unused `columnWidths` input on header row; `hasResizableColumns` computed never used. |

**What's *not* the problem:** virtualization itself. CDK virtual scroll with
`minBufferPx/maxBufferPx` is fine — only ~15 row components exist at any time.
The cost is all in the eager form and the rebuild fan-out.

---

## 5. Rethink — "Formly, but for grid cells"

Formly's schema model, distilled:

1. **`FormlyFieldConfig` = plain, serializable schema** (`key`, `type`,
   `templateOptions/props`, `validators`, `expressions`, `wrappers`).
2. **A DI-based type registry** (`FORMLY_CONFIG`, hierarchical `forRoot` /
   `forChild`) maps `type: string` → component.
3. **One `FormlyField` renderer** resolves the type, creates the component
   *once* (`ViewContainerRef`), applies wrappers, and passes context through
   the field instance + injector — not through dozens of bindings.
4. **An expression/hook pipeline** evaluates dynamic bits (`hide`, `disabled`,
   expressions) once per model change — not once per CD pass.
5. **`FieldType` base class** gives every widget the same
   `field` / `form` / `model` API.

signal-grid already has (2) and a good analogue of (5). Here's the full mapping:

| Formly concept | signal-grid today | Recommendation |
|---|---|---|
| `FormlyFieldConfig` | `ColumnConfiguration` — a *class instance* mixing data, layout, and callbacks | Introduce **`ColumnSchema`**: plain, JSON-serializable data (server-drivable), + a `compileSchema()` step that produces the resolved column used at runtime. Builder becomes schema sugar. |
| type registry | `CellTypeRegistry` with parent-chain lookup — **exactly right, keep** | Keep; add a second registry for **wrappers**. |
| `FormlyField` renderer | `CellComponent` wrapper + `NgComponentOutlet` with 4 inputs, recreated bindings | **One structural directive `*sgCell`**: resolve → `createComponent` once → `setInput` only when a value actually changed → destroy with the row. Kills layer #5 entirely. |
| `FieldType` base | `BaseCellComponent` (`value()`, `setValue()`, `isEditable()`, `props()`) — good API, keep source-compatible | Slim the contract: cells inject a **`CellContext`** (signals: `row`, `column`, `value`, `rowIndex`, `store`) instead of receiving `columns/column/formGroup/index` as four inputs. |
| `templateOptions` | `props` ✔ | Keep; memoize per `(column, rowVersion)`. |
| expressions / `fieldChanges` | every callback (`type`, `isEditable`, `cellCssClass`, `props`) re-evaluated inside scattered per-cell computeds on every value change | Run all dynamic resolution in **one memoized pipeline per cell**, invalidated by a `rowVersion` signal — evaluated on data change, never per CD pass. |
| wrappers | — | `wrappers?: string[]` per column (validation message, tooltip, highlight ring…) resolved through a wrapper registry, composed around the cell component. |
| validation | none per cell | Optional per-column `validators` attached **only while the row group is attached** (see §6). |

### Target schema sketch

```ts
/** Plain data. Serializable — can come from a server, a form, JSON. */
export interface ColumnSchema {
  field: string;
  header?: string;
  type?: string | ((ctx: CellCallbackCtx) => string);   // registry name
  props?: CellProps | ((ctx: CellCallbackCtx) => CellProps);
  editable?: boolean | ((ctx: CellCallbackCtx) => boolean);
  cssClass?: (ctx: CellCallbackCtx) => string;
  wrappers?: string[];                                   // Formly-style
  validators?: ValidatorFn | ValidatorFn[];
  width?: number | (() => number);
  resizable?: boolean;
  sticky?: 'left' | 'right';
  pipe?: PipeType;
  pipeFormat?: string;
}

// usage — the whole grid config becomes data:
columns: ColumnSchema[] = [
  { field: 'age', header: 'Age', type: 'select-cell', editable: true,
    props: { options: [25, 50, 75, 100] }, width: 100,
    wrappers: ['validation'] },
];
```

### Target render sketch (single layer)

```html
@for (column of compiledColumns(); track column.field + '-' + $index) {
  <div class="div-cell" [class]="columnClass(column)">
    <ng-container *sgCell="column" [rowKey]="rowKey" [rowIndex]="index" />
  </div>
}
```

The `sgCell` directive: resolves `column.type` once (memoized), creates the
cell component once via `ViewContainerRef.createComponent`, provides
`CellContext` in the node injector, updates inputs **only when changed**, and
destroys the component when the row leaves the viewport.

---

## 6. State model — viewport-scoped forms (the big lever)

Replace "one giant eager FormGroup" with **attach/detach row forms + a sparse
edit store**, keyed by **row identity**:

```ts
@Injectable()
class GridStore {
  model = input<Model[]>();                     // source of truth for data
  edits = signal(new Map<rowKey, Map<field, value>>()); // sparse, only dirty rows
  versions = signal(new Map<rowKey, number>());         // bumps drive cell computeds

  attach(rowKey, row): FormGroup;   // built from model value + edits; called when row renders
  release(rowKey): void;            // keeps group only if dirty, else drops it (GC)
  setCellValue(rowKey, field, v): void;  // writes control + records edit + bumps version
  mergedModel(): Model[];           // model with edits applied — used by save()
}
```

- `RowComponent` attaches in its constructor effect (`inject(DestroyRef)` →
  release on destroy). cdkVirtualFor creates/destroys rows, so **cost is
  O(visible + dirty)**, never O(all rows).
- Filtering/sorting changes `model()` but **edits stay attached to their row
  keys** — the stale-index bug becomes structurally impossible.
- `save()` = `mergedModel()` once. `reset()` = clear `edits`, re-attach.
- Public compatibility: keep `grid.formGroup` as a getter exposing the
  *attached* groups (document it), or offer `toFormGroup()` for consumers who
  need the whole thing built on demand.

**Why not Angular's signal forms yet?** `@angular/forms/signals` graduated to
public API in v22 (confirmed present in this repo: `./signals` export in
`@angular/forms/package.json`) and is a natural fit for cell-level validation
state — **but** it still shows poor performance with very large arrays
([angular/angular#67212](https://github.com/angular/angular/issues/67212)).
The sparse/attached structure above is required regardless; the store can be
migrated to signal forms underneath later without changing the grid's API.

---

## 7. Comparison with existing solutions

| | Schema/registry | Rendering | Form/edit state | 10k rows | Flexibility |
|---|---|---|---|---|---|
| **@ngx-formly** | ★★★ (the model) | 1 comp/field, **no virtualization** — renders *every* field | reactive forms per field | not built for grids | high, but form-oriented |
| **ag-grid** | cellRenderer defs | **hand-rolled DOM**, bypasses Angular CD per cell | its own cell editing API | ★★★ best | your cells must live in *its* model/styling |
| **Ignite UI / PrimeNG grids** | column schema objects | comp/row + OnPush + virtualization | internal state | ★★ | medium — you're building a *library*, so adopting theirs defeats the purpose |
| **CDK table** | none | row components + virtualization | none (you build it) | ★★ | high, but no schema layer |
| **signal-grid (proposed)** | ColumnSchema + registry + wrappers (Formly-grade) | comp/cell behind a single outlet, OnPush, virtualized | viewport-attached row forms + sparse edits | ★★ (rows are free; only visible cells exist) | highest — your components, your registry, your CSS tokens |

**Why stay component-per-cell instead of ag-grid-style manual DOM?** With
virtualization only ~300 cell components exist at any moment; with OnPush +
signals they only re-render when *their* value changes. Manual DOM buys another
order of magnitude but costs you arbitrary Angular components in cells — which
is the whole point of your library. Only revisit if profiling shows Angular CD
itself (not the form machinery) as the bottleneck at your target size.

**Keep doing this (it's already right):**
- hierarchical registry (`GridModule.forRoot/forChild`) — same pattern as Formly's `FORMLY_CONFIG`.
- `BaseCellComponent` public API — maps cleanly to Formly's `FieldType`.
- `ColumnConfigurationBuilder` (becomes schema sugar).
- CSS-custom-property theming (`--signal-grid-*`).
- CDK viewport + header row outside the viewport + template-columns via CSS var (the staged change to set `--sg-grid-template-columns` on the wrapper once instead of per-row binding is a genuine improvement).
- Formly for the filter bar — and reuse its mental model for cells.

---

## 8. Phased action plan

### P0 — make it load and show correct data (hours)
1. Fix the effect loop (`untracked` / closure — §2) and merge the two init effects.
2. Fix stale carry-over: only carry **dirty** controls, keyed by row identity (§3.1).
3. Demo: restore OnPush (the unstaged edit already does), drop `console.log(model)` per keystroke.

### P1 — quick perf wins (1–2 days)
4. One change subscription per cell (delete the wrapper's duplicate effect; both wrapper and base cell currently subscribe to the same control).
5. Hoist the `inputs:` object / stop re-applying inputs each CD (memoize per cell).
6. Diff-aware rebuild: reuse row groups whose row object is identical
   (`Map<Model, FormGroup>`) → filtering becomes O(changed rows), not O(all rows).
7. Emit sparse patches (or pull-based `getChanges()`); delete the no-op `distinctUntilChanged`.
8. Fix the dirty indicator (once per row, version-driven), import `MatButtonModule`, make `isFormValid` reactive.
9. Track rows by stable `id`; move `value-indicator` out of the column loop.

### P2 — the schema architecture (the "Formly for cells" layer)
10. `ColumnSchema` (plain data) + `compile()` → resolved columns; builder becomes sugar over the schema.
11. `*sgCell` structural directive (create once / setInput-on-change / destroy with row) replacing wrapper + `NgComponentOutlet`; `CellContext` injection keeps `BaseCellComponent`'s API source-compatible.
12. `GridStore` with viewport attach/detach + sparse edits (§6) — row count stops mattering.
13. Wrapper registry + per-column validators + one memoized callback pipeline (Formly's expression model).
14. Update docs pages (they document the current public behavior) and **add a test target with a render smoke test** — none exists today (`CLAUDE.md`: no test targets configured), which is exactly why an infinite loop at boot got as far as it did.

### P3 — optional later
15. Migrate store internals to `@angular/forms/signals` (public in v22) once
    #67212 settles; keep the sparse structure either way.
16. Consider `linkedSignal` for the model↔edits projection (v22 API) instead
    of hand-rolled computeds.
