import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ColumnConfiguration } from '../models/models';
import { CellComponent } from '../cell/cell.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[lib-row]',
  standalone: true,
  imports: [CellComponent, CommonModule],
  templateUrl: './row.component.html',
  styleUrls: ['../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowComponent {
  formGroup = input<FormGroup | null>(null);
  index = input<number>();
  columns = input.required<ColumnConfiguration[]>();
  includeRowExpander = input(false);
  isHeaderRow = input(false);
  rowExpanderChange = output<boolean>();
  rowData = input<unknown>(null);
  rowExpanderConfig = input<any>(null);
  columnWidths = input<Record<string, string>>({});
  resizeStart = output<{ event: MouseEvent; column: ColumnConfiguration }>();
  isRowExpanded = signal(false);

  formControl = computed<AbstractControl | undefined>(() => {
    const idx = this.index();
    const fg = this.formGroup();
    return idx !== undefined && fg ? fg.controls[idx] : undefined;
  });

  toggleRowExpander() {
    this.isRowExpanded.update(v => !v);
    this.rowExpanderChange.emit(this.isRowExpanded());
  }
}
