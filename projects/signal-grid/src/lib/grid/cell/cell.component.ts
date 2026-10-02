import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CallbackParameter, ColumnConfiguration } from '../models/models';
import { CellTypeRegistry } from '../registry/cell-type-registry';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[lib-cell]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cell.component.html',
  styleUrls: ['../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellComponent {
  columns = input.required<ColumnConfiguration[]>();
  column = input.required<ColumnConfiguration>();
  formGroup = input<FormGroup | null>(null);
  index = input.required<number>();

  private readonly _registry = inject(CellTypeRegistry);
  private readonly _changes = signal(0);

  rowGroup = computed(() => {
    const fg = this.formGroup();
    const idx = this.index();
    return fg ? (fg.controls[idx] as FormGroup | undefined) : undefined;
  });
  rowValue = computed<Record<string, unknown>>(() => {
    this._changes();
    return this.rowGroup()?.getRawValue() ?? {};
  });
  callbackParameter = computed(
    () =>
      new CallbackParameter(
        this.rowValue()[this.column().fieldName],
        this.formGroup(),
        this.index(),
        () => this.column().fieldName
      )
  );
  typeName = computed(() => {
    const type = this.column().type;
    const name = typeof type === 'function' ? type(this.callbackParameter()) : type;
    return name || 'default';
  });
  resolved = computed(() => {
    const name = this.typeName();
    const component = this._registry.resolve(name);
    if (component) {
      return { component, column: this.column(), unknownName: null as string };
    }
    const readOnlyColumn: ColumnConfiguration = Object.assign(
      Object.create(ColumnConfiguration.prototype),
      this.column(),
      { isEditable: () => false }
    );
    return {
      component: this._registry.resolve('string'),
      column: readOnlyColumn,
      unknownName: name
    };
  });
  cssClass = computed(() => this.column().cellCssClass?.(this.callbackParameter()) ?? '');

  constructor() {
    effect(onCleanup => {
      const group = this.rowGroup();
      if (!group) {
        return;
      }
      const subscription = group.valueChanges.subscribe(() => this._changes.update(n => n + 1));
      onCleanup(() => subscription.unsubscribe());
    });
    effect(() => {
      const unknownName = this.resolved().unknownName;
      if (unknownName) {
        this._registry.warnUnknown(unknownName, this.column().fieldName);
      }
    });
  }
}
