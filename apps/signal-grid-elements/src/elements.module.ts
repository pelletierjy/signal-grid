import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { GridModule } from '../../../projects/signal-grid/src/lib/grid/grid.module';
import { GridComponent } from '../../../projects/signal-grid/src/lib/grid/grid/grid.component';

@NgModule({
  imports: [GridModule]
})
export class ElementsModule implements DoBootstrap {
  constructor(private _injector: Injector) {}

  ngDoBootstrap(): void {
    const signalGridElement = createCustomElement(GridComponent, { injector: this._injector });
    customElements.define('signal-grid', signalGridElement);
  }
}
