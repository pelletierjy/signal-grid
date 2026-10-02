import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../base-cell.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'lib-boolean-cell',
  standalone: true,
  imports: [MatCheckboxModule],
  template: `
    <mat-checkbox
      [checked]="!!value()"
      [disabled]="!isEditable()"
      (change)="setValue($event.checked)"></mat-checkbox>
  `,
  styleUrls: ['../../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooleanCellComponent extends BaseCellComponent {}
