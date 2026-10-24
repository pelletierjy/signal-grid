import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseCellComponent } from '../base-cell.component';
import { CellActionDef } from '../../models/models';

/**
 * Built-in cell rendering one button per entry of `props.actions`:
 *
 * ```ts
 * { field: 'id', type: 'actions', width: 170,
 *   props: { actions: [
 *     { id: 'edit', label: 'Edit' },
 *     { id: 'delete', label: 'Delete', variant: 'danger' },
 *   ] } }
 * ```
 *
 * Clicks are reported through the grid's `cellAction` output with
 * `{ action, rowKey, rowIndex, row }`. Actions ignore the read-only guard —
 * a read-only row can still be opened or deleted.
 */
@Component({
  selector: 'lib-actions-cell',
  standalone: true,
  template: `
    @for (action of actions(); track action.id) {
    <button
      type="button"
      class="sg-action"
      [class.sg-action--danger]="action.variant === 'danger'"
      [attr.data-action]="action.id"
      (click)="dispatchAction(action.id)">
      {{ action.label }}
    </button>
    }
  `,
  styles: [
    `
      .sg-action {
        border: 1px solid var(--signal-grid-border-color, #ccc);
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.85em;
        border-radius: var(--signal-grid-radius, 4px);
        padding: 2px 10px;
        margin-right: 6px;
        cursor: pointer;
      }
      .sg-action:hover {
        background: var(--signal-grid-row-alt-bg, rgba(0, 0, 0, 0.06));
      }
      .sg-action--danger {
        color: var(--signal-grid-danger, #c0392b);
        border-color: var(--signal-grid-danger, #c0392b);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsCellComponent extends BaseCellComponent {
  /** Sanitized button definitions from `props.actions`. */
  readonly actions = computed<CellActionDef[]>(() => {
    const props = this.props();
    const list = props?.['actions'];
    if (!Array.isArray(list)) {
      return [];
    }
    return list.filter(
      (item): item is CellActionDef =>
        !!item && typeof item.id === 'string' && typeof item.label === 'string'
    );
  });
}