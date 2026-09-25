import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Model } from '../models/model';
import { ColumnConfiguration } from '../models/models';

@Component({
  selector: 'signal-grid',
  standalone: false,
  templateUrl: 'grid.component.html',
  styleUrls: ['grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridComponent {
  model = input.required<Model[]>();
  columns = input.required<ColumnConfiguration[]>();
  includeRowExpander = input(false);
  modelChange = output<Model[]>();

  private readonly _formGroup = signal(new FormGroup({}));
  get formGroup(): FormGroup {
    return this._formGroup();
  }
  isExpanded: { [key: number]: boolean } = {};

  gridTemplateColumns = computed(
    () => `repeat(${this.columns().length + (this.includeRowExpander() ? 1 : 0)}, auto)`
  );

  private readonly _formValueChanges = toSignal(
    toObservable(this._formGroup).pipe(
      switchMap(group => group.valueChanges.pipe(map(() => group.getRawValue()))),
      debounceTime(250)
    )
  );

  trackByIndex = (index: number) => index;

  constructor() {
    effect(() => {
      const rows = _.cloneDeep(this.model());
      const columns = this.columns();
      // Build the groups bottom-up. FormGroup.addControl re-validates the whole group on every call,
      // which is quadratic for large models.
      const formGroup = new FormGroup(
        _.fromPairs(
          rows.map((row, index) => [
            index.toString(),
            new FormGroup(
              _.fromPairs(
                columns.map(column => [column.fieldName, new FormControl(row[column.fieldName])])
              )
            )
          ])
        )
      );
      this._formGroup.set(formGroup);
    });

    effect(() => {
      const value = this._formValueChanges();
      if (!value) {
        return;
      }
      this.modelChange.emit(Object.keys(value).map(key => value[key]));
    });
  }
}
