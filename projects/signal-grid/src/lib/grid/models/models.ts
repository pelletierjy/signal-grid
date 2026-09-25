import { FormGroup } from '@angular/forms';
import { CellProps, CellTypeName } from '../registry/cell-type-config';

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
    public value: any,
    public formGroup: FormGroup,
    public index: number,
    public fieldName: (callbackParameter) => string
  ) {}
}

// https://openmail.atlassian.net/wiki/spaces/QPLT/pages/929660929/Qool-Grid+Configuration
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
