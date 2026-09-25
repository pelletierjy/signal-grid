import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GridModule } from '../../../../projects/signal-grid/src/lib/grid/grid.module';
import { LazyBooleanCellComponent } from './lazy-boolean-cell.component';
import { LazyCellComponent } from './lazy-cell.component';
import { LazyGridComponent } from './lazy-grid.component';

@NgModule({
  declarations: [LazyGridComponent],
  imports: [
    CommonModule,
    GridModule.forChild({
      types: [
        { name: 'lazy-cell', component: LazyCellComponent },
        { name: 'boolean', component: LazyBooleanCellComponent }
      ]
    }),
    RouterModule.forChild([{ path: '', component: LazyGridComponent }])
  ]
})
export class LazyGridModule {}
