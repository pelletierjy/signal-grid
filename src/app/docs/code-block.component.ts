import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-code-block',
  standalone: false,
  template: '<pre><code>{{ code() }}</code></pre>',
  styles: [
    `
      pre {
        margin: 1rem 0;
        padding: 1rem;
        overflow-x: auto;
        background: var(--color-surface-alt);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text);
        font-size: 0.875rem;
        line-height: 1.5;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockComponent {
  code = input.required<string>();
}
