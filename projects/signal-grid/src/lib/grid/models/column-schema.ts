import { ValidatorFn } from '@angular/forms';
import { CellProps, CellTypeName } from '../registry/cell-type-config';
import { CallbackParameter, ColumnConfiguration, PipeType, SortOrder } from './models';

/** A per-row callback evaluated against a {@link CallbackParameter}. */
export type ColumnCallback<T> = (callback: CallbackParameter) => T;

/**
 * Plain-data column schema — the grid's equivalent of a Formly field config.
 *
 * A schema is just data (plus optional callbacks), so column sets can be built
 * from JSON, a server response, or a form. The grid compiles each schema into a
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
  /** Registered cell type name, or a callback choosing one per row. */
  type?: CellTypeName | ColumnCallback<CellTypeName>;
  /** Settings handed to the cell type, static or per row. */
  props?: CellProps | ColumnCallback<CellProps>;
  /** Whether cells are editable — a flag or a per-row callback. */
  editable?: boolean | ColumnCallback<boolean>;
  /** Extra class for the cell container, computed per row. */
  cssClass?: ColumnCallback<string>;
  /** Fixed pixel width, or a callback returning one. */
  width?: number | (() => number);
  /** Show the resize handle on this column's header. */
  resizable?: boolean;
  /** Suggested display position (grid renders in array order today). */
  position?: number;
  /** Sticky column marker (rendering not implemented yet). */
  sticky?: boolean;
  /** Whether the column shows — flag or per-row callback (default true). */
  visible?: boolean | ColumnCallback<boolean>;
  /** Pipe applied by cells that support formatting. */
  pipe?: PipeType;
  /** Format string for the pipe. */
  pipeFormat?: string;
  /** Value shown when the cell value is null/undefined. */
  nullSubstitute?: string;
  /** Default sort order (grid does not sort on its own yet). */
  sortOrder?: SortOrder;
  /** Custom sort comparator for this column. */
  customSort?: (callback: CallbackParameter, sortOrder: SortOrder) => number;
  /** Click handler wired by cells that render an interactive root element. */
  onCellClick?: (event: MouseEvent, data: unknown) => void;
  /** Default value factory for editors. */
  defaultValue?: ColumnCallback<unknown>;
  /**
   * Names of registered cell wrappers (outermost first), composed around the
   * cell component — the signal-grid equivalent of Formly's `wrappers`.
   */
  wrappers?: string[];
  /** Sync validators attached to the row's form control for this field. */
  validators?: ValidatorFn | ValidatorFn[];
}

function toFlagCallback(
  value: boolean | ColumnCallback<boolean> | undefined,
  fallback: boolean
): ColumnCallback<boolean> {
  if (typeof value === 'function') {
    return value;
  }
  if (typeof value === 'boolean') {
    return () => value;
  }
  return () => fallback;
}

/** Compiles a plain {@link ColumnSchema} into a runtime {@link ColumnConfiguration}. */
export function compileColumn(schema: ColumnSchema): ColumnConfiguration {
  const column = new ColumnConfiguration(schema.header ?? '', schema.field, schema.type);
  column.columnHeaderText = schema.header ?? '';
  if (schema.tooltip != null) {
    column.tooltipText = schema.tooltip;
  }
  column.props = schema.props;
  column.isEditable = toFlagCallback(schema.editable, false);
  column.isColumnVisible = toFlagCallback(schema.visible, true);
  if (schema.cssClass) {
    column.cellCssClass = schema.cssClass;
  }
  if (schema.width != null) {
    if (typeof schema.width === 'number') {
      column.width = schema.width;
    } else {
      column.getWidth = schema.width;
    }
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
  if (schema.customSort) {
    column.customSort = schema.customSort;
  }
  if (schema.onCellClick) {
    column.onCellClick = schema.onCellClick;
  }
  if (schema.defaultValue) {
    column.defaultValue = schema.defaultValue;
  }
  column.wrappers = schema.wrappers ? [...schema.wrappers] : [];
  column.validators = schema.validators ?? null;
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
