import { Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { CellProps, CellTypeName } from '../registry/cell-type-config';
import { Model } from './model';

export enum SortOrder {
  Default = 0,
  Ascending = 1,
  Descending = -1
}

export enum InputRequiredType {
  Optional = 0,
  Required
}

export enum LookupDisplayType {
  Value = 0,
  Label
}

export enum PipeType {
  Default = 0,
  Percent,
  Currency,
  Date,
  Time,
  DateTime,
  Decimal,
  DaysOrHours
}

export class CallbackParameter {
  constructor(
    public value: unknown,
    public formGroup: FormGroup,
    public index: number,
    public fieldName: (callbackParameter) => string
  ) {}
}

export class ColumnConfiguration {
  static readonly numberColumnIndex = -1000;
  static readonly nA = 'nA';
  static readonly signalGridRowSelectorFieldName = 'signalGridRowSelectorFieldName';
  readonly GUID: string;
  // The following properties are for JSON dump purpose to have visibility on the field name
  readonly isRowSelector: boolean;
  // The following properties could easily be turned into callback like the following ones as needed.
  visibleColumnNumber: number;
  sortOrder: SortOrder = SortOrder.Default;
  inputRequiredType = InputRequiredType.Optional;
  columnHeaderText = '';
  tooltipText = '';
  lookupDisplayType = LookupDisplayType.Value;
  pipeType: PipeType = PipeType.Default;
  pipeFormat = '';
  nullSubstitute: string = null;
  width: number;
  getWidth: () => number;
  resizable = false;
  position: number = null;
  isSticky = false;
  stickyLeftSiblings: ColumnConfiguration[];
  stickyLeft = 0;
  customSort: (callback: CallbackParameter, sortOrder: SortOrder) => number;
  onCellClick: (event: MouseEvent, data: any) => void;
  isColumnVisible: (callback: CallbackParameter) => boolean;
  isEditable: (callback: CallbackParameter) => boolean;
  defaultValue: (callback: CallbackParameter) => any;
  defaultSelectedRowCellValue: (callback: CallbackParameter) => any;
  cellCssClass: (callback: CallbackParameter) => string;
  props?: CellProps | ((callback: CallbackParameter) => CellProps);
  customFooter: (data: any[]) => any = null;

  constructor(
    public text: string,
    public fieldName: string,
    public type?: CellTypeName | ((callback: CallbackParameter) => CellTypeName)
  ) {
    //this.GUID = GUIDBuilder.build();
    this.columnHeaderText = text;
    this.tooltipText = text;
  }
}

/**
 * Formly filter form configuration.
 * When provided, the grid renders an optional filter form above its content.
 */
export interface SignalGridFilterFormConfig {
  /** Formly field definitions. */
  fields: FormlyFieldConfig[];
  /** Optional model object that the form operates on. */
  model?: Record<string, unknown>;
  /** Text for the submit button (default: "Apply"). */
  submitBtnText?: string;
  /** Text for the reset button (default: "Reset"). */
  resetBtnText?: string;
  /** Whether to show the reset button (default: true). */
  showReset?: boolean;
}

/**
 * Configuration for the row expander component.
 * When provided, the grid renders a row expander button in each row.
 */
export interface RowExpanderConfig {
  /** The component to instantiate when a row is expanded. */
  component: Type<unknown>;
  /** Width of the expander column (default: 40px). */
  width?: number;
}
