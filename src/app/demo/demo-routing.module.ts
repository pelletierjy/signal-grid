import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DemoComponent } from './demo/demo.component';
import { DemoGridComponent } from './demo-grid/demo-grid.component';

const routes: Routes = [
  {
    path: 'demo',
    component: DemoComponent,
    children: [
      {
        path: '',
        component: DemoGridComponent
      },
      {
        path: 'demo-grid',
        component: DemoGridComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule {}
