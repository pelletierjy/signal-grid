import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GridModule } from '../../../projects/signal-grid/src/lib/grid/grid.module';
import { GridComponent } from '../../../projects/signal-grid/src/lib/grid/grid/grid.component';
import { FooterModule } from '../footer/footer.module';
import { AngularMaterialModule } from '../shared/angular-material.module';
import { CodeBlockComponent } from './code-block.component';
import { DocsRoutingModule } from './docs-routing.module';
import { DocsComponent } from './docs.component';
import { CellTypesPageComponent } from './pages/cell-types-page.component';
import { ColumnsPageComponent } from './pages/columns-page.component';
import { GettingStartedPageComponent } from './pages/getting-started-page.component';
import { StylingPageComponent } from './pages/styling-page.component';
import { WebComponentPageComponent } from './pages/web-component-page.component';

@NgModule({
  declarations: [
    DocsComponent,
    CodeBlockComponent,
    GettingStartedPageComponent,
    ColumnsPageComponent,
    CellTypesPageComponent,
    StylingPageComponent,
    WebComponentPageComponent
  ],
  imports: [AngularMaterialModule, CommonModule, DocsRoutingModule, FooterModule, GridModule, GridComponent]
})
export class DocsModule {}
