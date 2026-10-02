import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import deepEqual from 'fast-deep-equal';

// @dynamic
export class Utility {
  static isNullOrEmpty(value: any): boolean {
    return (
      this.isDefined(value) === false ||
      (this.isArray(value) && value.length === 0) ||
      (this.isArray(value) === false && value === '')
    );
  }

  static isPathNullOrEmpty(value: any, subProperties: any): boolean {
    return this.isNullOrEmpty(this._isFullPathValid(value, subProperties));
  }

  static isFunction(value: any): boolean {
    return this.isDefined(value) && isFunction(value);
  }

  static isArray(value: any) {
    return this.isDefined(value) && isArray(value);
  }

  static isDefined(value: any, subProperties: (string | number)[] = []): boolean {
    return this._isDefined(this._isFullPathValid(value, subProperties));
  }

  static isArraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  private static _isFullPathValid(value: any, subProperties: (string | number)[]): any {
    let currentValue = value;
    if (!this._isDefined(currentValue)) {
      return null;
    }
    for (const prop of subProperties) {
      currentValue = currentValue[prop];
      if (!this._isDefined(currentValue)) {
        return null;
      }
    }
    return currentValue;
  }

  static isNullOrUndefined(value?: any) {
    return value == null;
  }

  static isBoolean(value?: any): boolean {
    return typeof value === 'boolean';
  }

  static isString(value?: any): boolean {
    return typeof value === 'string';
  }

  static isTrue(value: any) {
    return !this.isNullOrEmpty(value) && this.isBoolean(value) && value === true;
  }

  private static _isDefined(value: any) {
    return !(
      this.isNullOrUndefined(value) ||
      typeof value === 'undefined' ||
      (!value && value !== 0 && value !== false) ||
      isUndefined(value)
    );
  }

  static isNumber(value: any) {
    return (
      this.isDefined(value) &&
      this.isNullOrEmpty(value) === false &&
      !isNaN(Number(value)) &&
      !this.isString(value)
    );
  }

  static isStringNumber(value: any): boolean {
    return this._isDefined(value) && this.isString(value) && this.isNumber(parseInt(value, 10));
  }

  static equals(a: any, b: any): boolean {
    return deepEqual(a, b);
  }

  static isFound(value: any): boolean {
    return this._isDefined(value) && value !== -1;
  }
}
