import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-eager-cell',
  standalone: true,
  template: ` <span class="eager">⚡</span><span class="val">{{ value() }}</span> `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        height: 100%;
      }

      .eager {
        font-size: 0.85rem;
        filter: drop-shadow(0 1px 2px rgba(251, 191, 36, 0.4));
      }

      .val {
        font-weight: 600;
        color: var(--color-text);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EagerCellComponent extends BaseCellComponent {}
