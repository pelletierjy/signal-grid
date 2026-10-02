import { Pipe, PipeTransform } from '@angular/core';
import { CallbackParameter } from '../models/models';

@Pipe({ name: 'dynamicPipe', standalone: true })
export class DynamicPipe implements PipeTransform {
  transform(
    value: any,
    callback: (callbackParameter: CallbackParameter) => any,
    formGroup,
    index,
    name
  ): any {
    if (callback) {
      return callback(new CallbackParameter(value, formGroup, index, name));
    }
  }
}
