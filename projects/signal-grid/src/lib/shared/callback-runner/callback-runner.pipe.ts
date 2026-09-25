import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'callbackRunnerPipe', standalone: false })
export class CallbackRunnerPipe implements PipeTransform {
  transform(value: any, callback: (value) => boolean): any {
    if (callback) {
      return callback(value);
    }
  }
}
