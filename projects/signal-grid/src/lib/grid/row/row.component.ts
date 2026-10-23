import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  Type
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Model } from '../models/model';
import { ColumnConfiguration } from '../models/models';
import { GridStore } from '../services/grid-store';
import { CellOutletDirective } from '../cell/cell-outlet.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[lib-row]',
  standalone: true,
  imports: [CommonModule, CellOutletDirective],
  templateUrl: './row.component.html',
  styleUrls: ['../grid/grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowComponent {
  columns = input.required<ColumnConfiguration[]>();
  index = input<number>(null);
  rowData = input<Model>(null);
  includeRowExpander = input(false);
  isHeaderRow = input(false);
  rowExpanderConfig = input<Type<unknown>>(null);
  columnWidths = input<Record<string, string>>({});
  rowExpanderChange = output<boolean>();
  resizeStart = output<{ event: MouseEvent; column: ColumnConfiguration }>();
  isRowExpanded = signal(false);

  private readonly store = inject(GridStore);

  /** Stable identity of this row within the store. Null for the header row. */
  rowKey = computed(() => {
    const row = this.rowData();
    return row ? this.store.keyFor(row) : null;
  });

  /**
   * The row's form group, created on demand from row data + recorded edits.
   * Reading this in the template *before* the cells guarantees every cell sees
   * an attached group on first render; the epoch/state deps rebuild it after a
   * reset or column change.
   */
  group = computed(() => {
    const key = this.rowKey();
    if (!key) {
      return null;
    }
    this.store.epoch();
    return this.store.ensureRow(key, this.rowData());
  });

  /** Whether this row has unsaved edits (reactive via the store). */
  dirty = computed(() => {
    const key = this.rowKey();
    return key ? this.store.dirty(key)() : false;
  });

  constructor() {
    // Release the row's group when the row scrolls out or its identity changes.
    effect(onCleanup => {
      const key = this.rowKey();
      if (!key) {
        return;
      }
      onCleanup(() => this.store.release(key));
    });
  }

  toggleRowExpander() {
    this.isRowExpanded.update(v => !v);
    this.rowExpanderChange.emit(this.isRowExpanded());
  }
}
