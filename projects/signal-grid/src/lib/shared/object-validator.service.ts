import { Injectable } from '@angular/core';
import * as _ from 'lodash';

// Do not export the Utility class. It should be used only by the ovs
class Utility {
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
    return this.isDefined(value) && _.isFunction(value);
  }

  static isArray(value: any) {
    return this.isDefined(value) && _.isArray(value);
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
    return (
      value === '' ||
      !(
        this.isNullOrUndefined(value) ||
        typeof value === 'undefined' ||
        value === 'undefined' ||
        (!value && value !== 0 && value !== false) ||
        _.isUndefined(value)
      )
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
    return JSON.stringify(a) === JSON.stringify(b);
  }

  static isFound(value: any): boolean {
    return this._isDefined(value) && value !== -1;
  }

  static cleanObject(obj?: any): any {
    if (!Utility.isDefined(obj)) {
      return obj;
    } else if (Array.isArray(obj)) {
      return obj
        .map(value => (value && typeof value === 'object' ? this.cleanObject(value) : value))
        .filter(value => !(value == null));
    } else if (Utility.isNumber(obj) || Utility.isString(obj) || Utility.isBoolean(obj)) {
      return obj;
    } else {
      return Object.entries(obj)
        .map(([key, value]) => [
          key,
          value && typeof value === 'object' ? this.cleanObject(value) : value
        ])
        .reduce(
          (accumulator, [key, value]) =>
            value == null ? accumulator : ((accumulator[key] = value), accumulator),
          {}
        );
    }
  }
}

@Injectable()
export class ObjectValidatorService {
  isNullOrEmpty(value: any): boolean {
    return Utility.isNullOrEmpty(value);
  }

  isObject(value: any): boolean {
    return !Utility.isNullOrEmpty(value) && typeof value === 'object' && !Array.isArray(value);
  }

  isJsonString(value: any): boolean {
    let isJson = false;
    try {
      JSON.parse(value);
      isJson = true;
    } catch {
      isJson = false;
    }
    return isJson;
  }

  isObjectNullOrEmpty(value: any): boolean {
    return (
      Utility.isNullOrEmpty(value) ||
      !this.isObject(value) ||
      Utility.isNullOrEmpty(Object.keys(value))
    );
  }

  isPathNullOrEmpty(value: any, subProperties: (string | number)[]): boolean {
    return Utility.isPathNullOrEmpty(value, subProperties);
  }

  isFunction(value: any): boolean {
    return Utility.isFunction(value);
  }

  isArray(value: any) {
    return Utility.isArray(value);
  }

  isDefined(value: any, subProperties: (string | number)[] = []): boolean {
    return Utility.isDefined(value, subProperties);
  }

  isArraysEqual(a: number[], b: number[]): boolean {
    return Utility.isArraysEqual(a, b);
  }

  isNullOrUndefined(value?: any) {
    return Utility.isNullOrUndefined(value);
  }

  isBoolean(value?: any): boolean {
    return Utility.isBoolean(value);
  }

  isString(value?: any): boolean {
    return Utility.isString(value);
  }

  isTrue(value: any) {
    return Utility.isTrue(value);
  }

  isNumber(value: any) {
    return Utility.isNumber(value);
  }

  isStringNumber(value: any): boolean {
    return Utility.isStringNumber(value);
  }

  equals(a: any, b: any): boolean {
    return Utility.equals(a, b);
  }

  isFound(value: any): boolean {
    return Utility.isFound(value);
  }

  cleanObject(obj?: any): any {
    return Utility.cleanObject(obj);
  }
}
