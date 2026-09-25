import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-eager-cell',
  standalone: true,
  template: '⚡ {{ value() }}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EagerCellComponent extends BaseCellComponent {}
