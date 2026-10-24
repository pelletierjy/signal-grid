import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-lazy-boolean-cell',
  standalone: true,
  template: ` <span class="bool" [class.yes]="value()">{{ value() ? 'YES' : 'NO' }}</span> `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
      }

      .bool {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        background: var(--color-border);
        color: var(--color-text-muted);
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .bool.yes {
        background: #dcfce7;
        color: #166534;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyBooleanCellComponent extends BaseCellComponent {}
