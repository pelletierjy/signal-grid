import { Directive, effect, inject, input, ViewContainerRef } from '@angular/core';
import { WrapperRenderSpec } from './base-cell-wrapper';

/**
 * Anchor a {@link BaseCellWrapper} template uses to receive the rest of the
 * cell render chain. Bind it to the wrapper's `host()` input:
 *
 * ```html
 * <div class="my-wrapper"><ng-container [sgWrapperHost]="host()"></ng-container></div>
 * ```
 */
@Directive({ selector: '[sgWrapperHost]', standalone: true })
export class WrapperHostDirective {
  /** The render spec provided by the grid through the wrapper's `host` input. */
  sgWrapperHost = input<WrapperRenderSpec | null>(null);

  private readonly vcr = inject(ViewContainerRef);

  constructor() {
    // Chain continuation is owned by the cell outlet: it tracks every created
    // component and destroys the whole chain itself.
    effect(() => {
      const spec = this.sgWrapperHost();
      if (spec) {
        spec.render(this.vcr);
      }
    });
  }
}
