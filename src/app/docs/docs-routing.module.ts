import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocsComponent } from './docs.component';
import { CellTypesPageComponent } from './pages/cell-types-page.component';
import { ColumnsPageComponent } from './pages/columns-page.component';
import { GettingStartedPageComponent } from './pages/getting-started-page.component';
import { StylingPageComponent } from './pages/styling-page.component';
import { WebComponentPageComponent } from './pages/web-component-page.component';

const routes: Routes = [
  {
    path: 'docs',
    component: DocsComponent,
    children: [
      { path: '', redirectTo: 'getting-started', pathMatch: 'full' },
      { path: 'getting-started', component: GettingStartedPageComponent },
      { path: 'columns', component: ColumnsPageComponent },
      { path: 'cell-types', component: CellTypesPageComponent },
      { path: 'styling', component: StylingPageComponent },
      { path: 'web-component', component: WebComponentPageComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocsRoutingModule {}
