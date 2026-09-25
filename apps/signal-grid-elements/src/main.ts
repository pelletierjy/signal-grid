import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@angular/compiler';
import { ElementsModule } from './elements.module';

platformBrowserDynamic()
  .bootstrapModule(ElementsModule)
  .catch(err => console.error(err));
