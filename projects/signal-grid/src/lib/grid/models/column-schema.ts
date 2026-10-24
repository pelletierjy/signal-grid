import { ValidatorFn } from '@angular/forms';
import { CellProps, CellTypeName } from '../registry/cell-type-config';
import { CallbackParameter, ColumnConfiguration, PipeType, SortOrder } from './models';
import { evaluateExpression, ExpressionContext } from '../shared/expression';

/** A per-row callback evaluated against a {@link CallbackParameter} (TypeScript configs). */
export type ColumnCallback<T> = (callback: CallbackParameter) => T;

/**
 * Formly-style dynamic column properties as **plain strings**, so the whole
 * column definition stays JSON-serializable. Compiled into callbacks once, at
 * schema-compile time — runtime cost is identical to hand-written callbacks.
 *
 * ```jsonc
 * "expressions": {
 *   "type": "row.isActive ? 'status-badge' : 'string'",
 *   "editable": "index % 3 !== 0",
 *   "props": "({ options: [value, 'Alpha', 'Beta'] })"
 * }
 * ```
 *
 * Available names: `row`, `value`, `index`, `field`, `formGroup`.
 * Security note: expressions compile via `new Function` (same trust model as
 * @ngx-formly) — only load schemas from trusted sources.
 */
export interface ColumnExpressions {
  /** Cell type name for this row (overrides the static `type`). */
  type?: string;
  /** Props object for this row (falls back to static `props` when it yields undefined). */
  props?: string;
  /** Whether cells are editable for this row (overrides static `editable`). */
  editable?: string;
  /** Extra cell-container class for this row (overrides static `cssClass`). */
  cssClass?: string;
  /** Whether the column shows for this row (overrides static `visible`). */
  visible?: string;
}

/**
 * Plain-data column schema — the grid's equivalent of a Formly field config.
 *
 * **JSON-first**: every field here is JSON-serializable (functions live on
 * {@link ColumnConfiguration} for TypeScript configs; per-row dynamics live in
 * {@link ColumnExpressions} strings). Column sets can therefore come from JSON,
 * a server response, or a config file. The grid compiles each schema into a
 * {@link ColumnConfiguration} once per `columns` change; nothing here is
 * evaluated per cell or per change-detection pass.
 *
 * Both schemas and `ColumnConfiguration` instances are accepted by the grid's
 * `columns` input.
 */
export interface ColumnSchema {
  /** The row property this column shows and edits. */
  field: string;
  /** Header text (defaults to an empty string). */
  header?: string;
  /** Tooltip for the header cell (defaults to the header text). */
  tooltip?: string;
  /** Registered cell type name — static; use `expressions.type` for per-row types. */
  type?: CellTypeName;
  /** Settings handed to the cell type (static). */
  props?: CellProps;
  /** Whether cells are editable (static). */
  editable?: boolean;
  /** Extra class for the cell container (static). */
  cssClass?: string;
  /** Fixed pixel width in px. */
  width?: number;
  /** Show the resize handle on this column's header. */
  resizable?: boolean;
  /** Suggested display position (grid renders in array order today). */
  position?: number;
  /** Sticky column marker (rendering not implemented yet). */
  sticky?: boolean;
  /** Whether the column shows (default true). */
  visible?: boolean;
  /** Pipe applied by cells that support formatting. */
  pipe?: PipeType;
  /** Format string for the pipe. */
  pipeFormat?: string;
  /** Value shown when the cell value is null/undefined. */
  nullSubstitute?: string;
  /** Default sort order (grid does not sort on its own yet). */
  sortOrder?: SortOrder;
  /**
   * Names of registered cell wrappers (outermost first), composed around the
   * cell component — the signal-grid equivalent of Formly's `wrappers`.
   */
  wrappers?: string[];
  /**
   * Sync validators attached to the row's form control for this field.
   * NOTE: functions — TypeScript-only, not part of the JSON contract
   * (same stance as Formly's `validators`).
   */
  validators?: ValidatorFn | ValidatorFn[];
  /** Per-row dynamics as expression strings (keeps the schema JSON-serializable). */
  expressions?: ColumnExpressions;
}

/** Builds the evaluation context handed to expressions by a column callback. */
function expressionContext(callback: CallbackParameter): ExpressionContext {
  const formGroup = callback.formGroup;
  let row: Record<string, unknown> = {};
  if (formGroup) {
    try {
      row = formGroup.getRawValue();
    } catch {
      row = {};
    }
  }
  return {
    row,
    value: callback.value,
    index: callback.index,
    field: callback.fieldName(callback),
    formGroup
  };
}

/** Compiles a plain {@link ColumnSchema} into a runtime {@link ColumnConfiguration}. */
export function compileColumn(schema: ColumnSchema): ColumnConfiguration {
  const column = new ColumnConfiguration(schema.header ?? '', schema.field, schema.type);
  column.columnHeaderText = schema.header ?? '';
  if (schema.tooltip != null) {
    column.tooltipText = schema.tooltip;
  }
  column.props = schema.props;
  column.isEditable = () => schema.editable === true;
  column.isColumnVisible = () => schema.visible !== false;
  if (schema.cssClass) {
    const cssClass = schema.cssClass;
    column.cellCssClass = () => cssClass;
  }
  if (schema.width != null) {
    column.width = schema.width;
  }
  if (schema.resizable != null) {
    column.resizable = schema.resizable;
  }
  if (schema.position != null) {
    column.position = schema.position;
  }
  if (schema.sticky != null) {
    column.isSticky = schema.sticky;
  }
  if (schema.pipe != null) {
    column.pipeType = schema.pipe;
  }
  if (schema.pipeFormat != null) {
    column.pipeFormat = schema.pipeFormat;
  }
  if (schema.nullSubstitute != null) {
    column.nullSubstitute = schema.nullSubstitute;
  }
  if (schema.sortOrder != null) {
    column.sortOrder = schema.sortOrder;
  }
  column.wrappers = schema.wrappers ? [...schema.wrappers] : [];
  column.validators = schema.validators ?? null;

  // Expressions: compiled once, here. They ride the existing callback slots,
  // so the outlet/base-cell runtime and its memoized computeds are unchanged.
  const expr = schema.expressions;
  if (expr) {
    if (expr.type) {
      const source = expr.type;
      column.type = callback =>
        (evaluateExpression<string>(source, expressionContext(callback)) as CellTypeName) || 'default';
    }
    if (expr.editable) {
      const source = expr.editable;
      column.isEditable = callback =>
        !!evaluateExpression<boolean>(source, expressionContext(callback));
    }
    if (expr.visible) {
      const source = expr.visible;
      column.isColumnVisible = callback =>
        evaluateExpression<boolean>(source, expressionContext(callback)) !== false;
    }
    if (expr.cssClass) {
      const source = expr.cssClass;
      column.cellCssClass = callback =>
        evaluateExpression<string>(source, expressionContext(callback)) ?? '';
    }
    if (expr.props) {
      const source = expr.props;
      const staticProps = column.props;
      const staticFn =
        typeof staticProps === 'function'
          ? (staticProps as (callback: CallbackParameter) => CellProps)
          : undefined;
      column.props = callback =>
        evaluateExpression<Record<string, unknown>>(source, expressionContext(callback)) ??
        (staticFn ? staticFn(callback) : (staticProps as CellProps)) ??
        {};
    }
  }

  return column;
}

/**
 * Compiles a mixed array of schemas and already-built columns into
 * `ColumnConfiguration`s. Existing instances pass through untouched.
 */
export function compileColumns(
  columns: (ColumnSchema | ColumnConfiguration)[]
): ColumnConfiguration[] {
  return columns.map(column =>
    column instanceof ColumnConfiguration ? column : compileColumn(column)
  );
}
