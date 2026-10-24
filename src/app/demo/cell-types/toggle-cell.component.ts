import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from '../../../../projects/signal-grid/src/lib/grid/cell/base-cell.component';

@Component({
  selector: 'app-toggle-cell',
  standalone: true,
  template: `
    <button
      type="button"
      class="toggle"
      [class.on]="value()"
      [class.off]="!value()"
      [disabled]="!isEditable()"
      (click)="setValue(!value())">
      <span class="thumb"></span>
      <span class="label">{{ value() ? 'ON' : 'OFF' }}</span>
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        height: 100%;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.2rem 0.6rem 0.2rem 0.2rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        transition: background-color 0.2s ease, opacity 0.2s ease;
        outline: none;
        min-height: 1.6rem;
      }

      .toggle:focus-visible {
        box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.25);
      }

      .toggle:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toggle.on {
        background-color: #10b981;
        color: #ffffff;
      }

      .toggle.off {
        background-color: var(--color-border);
        color: var(--color-text-muted);
      }

      .thumb {
        width: 1.1rem;
        height: 1.1rem;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease;
      }

      .label {
        min-width: 1.5rem;
        text-align: center;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleCellComponent extends BaseCellComponent {}
