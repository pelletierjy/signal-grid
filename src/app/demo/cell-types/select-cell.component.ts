import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-select-cell',
  standalone: true,
  imports: [MatSelectModule, MatOptionModule],
  template: `
    @if (isEditable()) {
    <mat-select [value]="value()" (selectionChange)="setValue($event.value)">
      @for (option of $any(props()).options ?? []; track option) {
      <mat-option [value]="option">{{ option }}</mat-option>
      }
    </mat-select>
    } @else {
    {{ value() }}
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCellComponent extends BaseCellComponent {}
