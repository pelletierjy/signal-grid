import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ColumnConfiguration } from '../models/models';

@Component({
  selector: '[lib-row]',
  standalone: false,
  templateUrl: './row.component.html',
  styleUrls: ['../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowComponent {
  formGroup = input.required<FormGroup>();
  index = input<number>();
  columns = input.required<ColumnConfiguration[]>();
  includeRowExpander = input(false);
  isHeaderRow = input(false);
  rowExpanderChange = output<boolean>();

  isRowExpanded = false;

  formControl = computed<AbstractControl>(() => {
    const index = this.index();
    return index !== undefined ? this.formGroup().controls[index] : undefined;
  });

  toggleRowExpander() {
    this.isRowExpanded = !this.isRowExpanded;
    this.rowExpanderChange.emit(this.isRowExpanded);
  }
}
