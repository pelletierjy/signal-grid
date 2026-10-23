import {
  ComponentRef,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  Type,
  ViewContainerRef
} from '@angular/core';
import { CallbackParameter, ColumnConfiguration } from '../models/models';
import { BaseCellComponent } from './base-cell.component';
import { BaseCellWrapper, WrapperRenderSpec } from './wrappers/base-cell-wrapper';
import { CellTypeRegistry } from '../registry/cell-type-registry';
import { CellTypeName } from '../registry/cell-type-config';
import { CellWrapperRegistry } from '../registry/wrapper-registry';
import { GridStore } from '../services/grid-store';

function sameNames(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((name, i) => name === b[i]);
}

/**
 * The grid's cell renderer — the analogue of Formly's `formly-field`.
 *
 * One directive instance per rendered cell:
 * - resolves the column's `type` (static or per-row callback) through the
 *   {@link CellTypeRegistry}, plus optional {@link CellWrapperRegistry} wrappers,
 * - creates the cell component **once** via `ViewContainerRef.createComponent`,
 * - passes context through four inputs, updated only when they actually change
 *   (no per-CD `inputs:` object churn),
 * - reacts to value-driven type changes by swapping only the component,
 * - destroys the whole chain with the row.
 *
 * Value reactivity lives in the injected cell (`BaseCellComponent` computeds
 * reading the {@link GridStore}); this directive never re-binds on value change.
 *
 * Usage (inside a row template, after the row's group exists):
 * ```html
 * <div class="div-cell">
 *   <div sgCell [sgCellColumns]="columns()" [sgCellColumn]="column"
 *        [sgCellRowKey]="rowKey()" [sgCellRowIndex]="index()"></div>
 * </div>
 * ```
 */
@Directive({
  selector: '[sgCell]',
  standalone: true,
  host: { '[class]': 'hostClass()' }
})
export class CellOutletDirective {
  sgCellColumns = input.required<ColumnConfiguration[]>();
  sgCellColumn = input.required<ColumnConfiguration>();
  sgCellRowKey = input<string>(null);
  sgCellRowIndex = input<number>(null);

  private readonly registry = inject(CellTypeRegistry);
  private readonly wrapperRegistry = inject(CellWrapperRegistry);
  private readonly store = inject(GridStore);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private wrapperRefs: ComponentRef<BaseCellWrapper>[] = [];
  private cellRef: ComponentRef<BaseCellComponent> | null = null;
  private rendered: { component: Type<BaseCellComponent>; wrappers: string[] } | null = null;

  // ---- reactive resolution -------------------------------------------------

  private readonly rowGroup = computed(() => this.store.group(this.sgCellRowKey())());

  private readonly cellValue = computed(() => {
    this.store.version(this.sgCellRowKey())();
    return this.rowGroup()?.get(this.sgCellColumn().fieldName)?.value;
  });

  private readonly callbackParameter = computed(
    () =>
      new CallbackParameter(
        this.cellValue(),
        this.rowGroup(),
        this.sgCellRowIndex(),
        () => this.sgCellColumn().fieldName
      )
  );

  private readonly typeName = computed<CellTypeName>(() => {
    const type = this.sgCellColumn().type;
    if (typeof type === 'string') {
      return type || 'default';
    }
    if (typeof type === 'function') {
      return type(this.callbackParameter()) || 'default';
    }
    // No type configured (undefined/null) → the built-in default cell.
    return 'default';
  });

  private readonly resolved = computed(
    () => {
      const name = this.typeName();
      const component = this.registry.resolve(name);
      if (component) {
        return { component, column: this.sgCellColumn(), unknownName: null as CellTypeName };
      }
      // Unknown type: read-only string cell + one warning per name/field.
      const readOnlyColumn: ColumnConfiguration = Object.assign(
        Object.create(ColumnConfiguration.prototype),
        this.sgCellColumn(),
        { isEditable: () => false }
      );
      return {
        component: this.registry.resolve('string'),
        column: readOnlyColumn,
        unknownName: name
      };
    },
    {
      equal: (a, b) =>
        a.component === b.component && a.column === b.column && a.unknownName === b.unknownName
    }
  );

  /** Replaces the old wrapper component's `[class]` host binding. */
  readonly hostClass = computed(() => {
    const fn = this.sgCellColumn().cellCssClass;
    const extra = fn ? fn(this.callbackParameter()) : '';
    return 'div-cell-container ' + extra;
  });

  constructor() {
    effect(() => {
      const unknownName = this.resolved().unknownName;
      if (unknownName) {
        this.registry.warnUnknown(unknownName, this.sgCellColumn().fieldName);
      }
    });

    effect(() => {
      const resolved = this.resolved();
      const wrappers = resolved.column.wrappers ?? [];
      const needsRebuild =
        !this.rendered ||
        this.rendered.component !== resolved.component ||
        !sameNames(this.rendered.wrappers, wrappers);
      if (needsRebuild) {
        this.destroyChain();
        this.buildChain(resolved.component, wrappers);
        this.rendered = { component: resolved.component, wrappers: [...wrappers] };
      }
      this.applyInputs();
    });

    this.destroyRef.onDestroy(() => this.destroyChain());
  }

  // ---- chain construction --------------------------------------------------

  private buildChain(cellType: Type<BaseCellComponent>, wrappers: string[]): void {
    const build = (target: ViewContainerRef, names: string[]): void => {
      if (!names.length) {
        this.cellRef = target.createComponent(cellType);
        this.applyInputs();
        return;
      }
      const [name, ...rest] = names;
      const wrapperType = this.wrapperRegistry.resolve(name);
      if (!wrapperType) {
        this.wrapperRegistry.warnUnknown(name, this.sgCellColumn().fieldName);
        build(target, rest);
        return;
      }
      const wrapperRef = target.createComponent(wrapperType);
      this.wrapperRefs.push(wrapperRef);
      const spec: WrapperRenderSpec = { render: inner => build(inner, rest) };
      wrapperRef.setInput('host', spec);
      this.applyInputs();
    };
    build(this.vcr, [...wrappers]);
  }

  private applyInputs(): void {
    const column = this.resolved().column;
    const columns = this.sgCellColumns();
    const rowKey = this.sgCellRowKey();
    const rowIndex = this.sgCellRowIndex();
    for (const ref of this.wrapperRefs) {
      ref.setInput('columns', columns);
      ref.setInput('column', column);
      ref.setInput('rowKey', rowKey);
      ref.setInput('rowIndex', rowIndex);
    }
    if (this.cellRef) {
      this.cellRef.setInput('columns', columns);
      this.cellRef.setInput('column', column);
      this.cellRef.setInput('rowKey', rowKey);
      this.cellRef.setInput('rowIndex', rowIndex);
    }
  }

  private destroyChain(): void {
    this.cellRef?.destroy();
    this.cellRef = null;
    for (const ref of this.wrapperRefs) {
      ref.destroy();
    }
    this.wrapperRefs = [];
    this.rendered = null;
  }
}
