import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-lazy-cell',
  standalone: true,
  template: ` <span class="lazy">🦥</span><span class="val">{{ value() }}</span> `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        height: 100%;
      }

      .lazy {
        font-size: 0.85rem;
        opacity: 0.7;
      }

      .val {
        font-style: italic;
        color: var(--color-text-muted);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyCellComponent extends BaseCellComponent {}
