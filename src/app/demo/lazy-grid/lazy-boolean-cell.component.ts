import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-lazy-boolean-cell',
  standalone: true,
  template: "{{ value() ? 'YES' : 'NO' }}",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyBooleanCellComponent extends BaseCellComponent {}
