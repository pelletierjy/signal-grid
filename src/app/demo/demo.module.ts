import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from '../shared/angular-material.module';
import { DemoRoutingModule } from './demo-routing.module';
import { DocBlockModule } from '../shared/doc-block/doc-block.module';
import { HeroModule } from '../shared/hero/hero.module';
import { DemoComponent } from './demo/demo.component';
import { FooterModule } from '../footer/footer.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GridComponent } from '../../../projects/signal-grid/src/lib/grid/grid/grid.component';
import { DemoGridComponent } from './demo-grid/demo-grid.component';
import { EagerCellComponent } from './cell-types/eager-cell.component';
import { GridModule } from '../../../projects/signal-grid/src/lib/grid/grid.module';

@NgModule({
  declarations: [DemoComponent, DemoGridComponent],
  imports: [
    AngularMaterialModule,
    CommonModule,
    DemoRoutingModule,
    DocBlockModule,
    FormsModule,
    HeroModule,
    FooterModule,
    ScrollingModule,
    GridComponent,
    GridModule.forChild({ types: [{ name: 'eager-cell', component: EagerCellComponent }] })
  ]
})
export class DemoModule {}
