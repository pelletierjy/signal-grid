import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-status-badge-cell',
  standalone: true,
  template: `
    <span class="badge" [class.mapped]="!!mappedColor()" [style.background]="mappedColor()">
      {{ value() }}
    </span>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        background: var(--color-border);
        color: var(--color-text-muted);
        border: 1px solid transparent;
        transition: transform 0.15s ease;
      }

      .badge.mapped {
        border-color: rgba(0, 0, 0, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeCellComponent extends BaseCellComponent {
  mappedColor = computed(
    () => (this.props()['colors'] as Record<string, string> | undefined)?.[String(this.value())]
  );
}
