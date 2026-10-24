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
    <mat-select class="compact-select" [value]="value()" (selectionChange)="setValue($event.value)">
      @for (option of $any(props()).options ?? []; track option) {
      <mat-option [value]="option">{{ option }}</mat-option>
      }
    </mat-select>
    } @else {
    <span class="readonly-value">{{ value() }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      .compact-select {
        width: 100%;
        font-size: 0.875rem;
      }

      .readonly-value {
        color: var(--color-text);
        font-size: 0.875rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCellComponent extends BaseCellComponent {}
