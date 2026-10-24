import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DemoComponent } from './demo/demo.component';
import { BasicDemoComponent } from './basic-demo/basic-demo.component';
import { EditableDemoComponent } from './editable-demo/editable-demo.component';
import { CustomTypesDemoComponent } from './custom-types-demo/custom-types-demo.component';
import { PerRowDemoComponent } from './per-row-demo/per-row-demo.component';
import { FilteringDemoComponent } from './filtering-demo/filtering-demo.component';
import { RowExpanderDemoComponent } from './row-expander-demo/row-expander-demo.component';
import { FromSupportDemoComponent } from './from-support-demo/from-support-demo.component';

const routes: Routes = [
  {
    path: 'demo',
    component: DemoComponent,
    children: [
      { path: '', component: FromSupportDemoComponent },
      { path: 'basic', component: BasicDemoComponent },
      { path: 'editable', component: EditableDemoComponent },
      { path: 'custom-types', component: CustomTypesDemoComponent },
      { path: 'per-row', component: PerRowDemoComponent },
      { path: 'filtering', component: FilteringDemoComponent },
      { path: 'row-expander', component: RowExpanderDemoComponent },
      { path: 'from-support', component: FromSupportDemoComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule {}
