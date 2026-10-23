import { ValidatorFn } from '@angular/forms';
import { Utility } from '../shared/utility';
import { CallbackParameter, ColumnConfiguration } from '../models/models';
import { CellProps, CellTypeName } from '../registry/cell-type-config';

export class ColumnConfigurationBuilder {
  private _type: CellTypeName | ((callbackParameter: CallbackParameter) => CellTypeName);
  private _props: CellProps | ((callbackParameter: CallbackParameter) => CellProps);

  constructor() {}
  private _isEditable: (callbackParameter: CallbackParameter) => boolean = () => false;
  private _fieldWidth: number = null;
  private _resizable: boolean = true;
  private _wrappers: string[] = null;
  private _validators: ValidatorFn | ValidatorFn[] = null;
  private _fieldName: string; // The fieldName can't be dynamin anymore since it is bound to a form control.

  withType(
    type: CellTypeName | ((callbackParameter: CallbackParameter) => CellTypeName)
  ): ColumnConfigurationBuilder {
    this._type = type;
    return this;
  }

  withProps(
    props: CellProps | ((callbackParameter: CallbackParameter) => CellProps)
  ): ColumnConfigurationBuilder {
    this._props = props;
    return this;
  }

  withField(fieldName: string): ColumnConfigurationBuilder {
    this._fieldName = fieldName;
    return this;
  }

  editable(
    callback: (callbackParameter: CallbackParameter) => boolean = null
  ): ColumnConfigurationBuilder {
    if (!Utility.isFunction(callback)) {
      this._isEditable = () => true;
      return this;
    }
    this._isEditable = callback;
    return this;
  }

  resizable(value: boolean = true): ColumnConfigurationBuilder {
    this._resizable = value;
    return this;
  }

  width(widthPx: number): ColumnConfigurationBuilder {
    this._fieldWidth = widthPx;
    return this;
  }

  /** Cell wrapper names (outermost first), resolved through the wrapper registry. */
  wrappers(...names: string[]): ColumnConfigurationBuilder {
    this._wrappers = names;
    return this;
  }

  /** Sync validators attached to this field's control in every row group. */
  validators(validators: ValidatorFn | ValidatorFn[]): ColumnConfigurationBuilder {
    this._validators = validators;
    return this;
  }

  build(text: string = ''): ColumnConfiguration {
    const column = new ColumnConfiguration(text, this._fieldName, this._type);
    column.isEditable = this._isEditable;
    column.props = this._props;
    column.width = this._fieldWidth;
    column.resizable = this._resizable;
    if (this._wrappers) {
      column.wrappers = [...this._wrappers];
    }
    column.validators = this._validators;
    return column;
  }
}
