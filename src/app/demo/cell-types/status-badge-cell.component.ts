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
      .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.85em;
        background: var(--color-border);
        color: var(--color-text);
      }
      .badge.mapped {
        color: #1c1a26;
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
