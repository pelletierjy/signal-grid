import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home/home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'demo-lazy',
    loadChildren: () => import('./demo/lazy-grid/lazy-grid.module').then(m => m.LazyGridModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled' // ensures routerLinks start at the top of the new page.
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
