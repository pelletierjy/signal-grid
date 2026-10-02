import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../base-cell.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-default-cell',
  standalone: true,
  template: '<div class="default-cell"></div>',
  styleUrls: ['./default-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultCellComponent extends BaseCellComponent {}
