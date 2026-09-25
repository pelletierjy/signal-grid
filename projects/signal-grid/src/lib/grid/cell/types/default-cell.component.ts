import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../base-cell.component';

@Component({
  selector: 'lib-default-cell',
  standalone: false,
  template: '<div class="default-cell"></div>',
  styleUrls: ['./default-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultCellComponent extends BaseCellComponent {}
