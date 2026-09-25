import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-toggle-cell',
  standalone: true,
  template: `
    <button type="button" [disabled]="!isEditable()" (click)="setValue(!value())">
      {{ value() ? 'ON' : 'OFF' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleCellComponent extends BaseCellComponent {}
