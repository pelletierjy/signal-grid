import { computed, Directive, inject, input, InputSignal, Signal, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ColumnConfiguration } from '../../models/models';
import { GridStore } from '../../services/grid-store';

/**
 * The remaining piece of a cell render chain. A wrapper's template must
 * contain exactly one anchor:
 *
 * ```html
 * <div class="my-wrapper"><ng-container [sgWrapperHost]="host()"></ng-container></div>
 * ```
 *
 * The grid calls `render` with the anchor's `ViewContainerRef` to insert the
 * next wrapper (or the cell itself) inside the wrapper.
 */
export interface WrapperRenderSpec {
  render(target: ViewContainerRef): void;
}

/**
 * Base class for cell wrapper components — the signal-grid equivalent of
 * Formly's wrapper components. Registered via
 * `GridModule.forRoot({ wrappers: [...] })` and selected per column with
 * `wrappers: ['name']`.
 *
 * Subclass with a template that anchors `<ng-container [sgWrapperHost]="host()">`
 * where the cell (or the next wrapper) should appear.
 */
@Directive()
export abstract class BaseCellWrapper {
  /** Render chain continuation; bound by the grid, rendered into the anchor. */
  host = input<WrapperRenderSpec | null>(null);
  columns = input.required<ColumnConfiguration[]>();
  column = input.required<ColumnConfiguration>();
  rowKey = input<string>(null);
  rowIndex = input<number>(null);

  protected readonly store = inject(GridStore);

  /** The wrapped row's form group, when the row is rendered. */
  rowGroup: Signal<FormGroup | undefined> = computed(
    () => this.store.group(this.rowKey())() ?? undefined
  );

  /** Whether the wrapped row's group currently fails validation. */
  rowInvalid: Signal<boolean> = computed(() => !this.rowGroup()?.valid);
}
