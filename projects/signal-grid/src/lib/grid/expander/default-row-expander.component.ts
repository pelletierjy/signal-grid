import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Model } from '../models/model';

@Component({
  selector: 'sg-default-expander',
  standalone: true,
  template: `
    <div class="sg-default-expander">
      <h4>Row Data</h4>
      <pre>{{ jsonDump() }}</pre>
    </div>
  `,
  styles: [
    `
      .sg-default-expander {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        color: var(--color-text, #333);
      }
      h4 {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        color: var(--color-primary, #1e3a5f);
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        background-color: var(--color-surface-alt, #f6f7f9);
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid var(--color-border, #ddd);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultRowExpanderComponent {
  rowData = input<Model>();
  rowIndex = input<number>();
  jsonDump = computed(() => JSON.stringify(this.rowData(), null, 2));
}
