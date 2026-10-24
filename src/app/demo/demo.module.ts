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
import { EagerCellComponent } from './cell-types/eager-cell.component';
import { GridModule } from '../../../projects/signal-grid/src/lib/grid/grid.module';
import { CodeBlockComponent } from '../docs/code-block.component';
import { BasicDemoComponent } from './basic-demo/basic-demo.component';
import { EditableDemoComponent } from './editable-demo/editable-demo.component';
import { CustomTypesDemoComponent } from './custom-types-demo/custom-types-demo.component';
import { PerRowDemoComponent } from './per-row-demo/per-row-demo.component';
import { FilteringDemoComponent } from './filtering-demo/filtering-demo.component';
import { RowExpanderDemoComponent } from './row-expander-demo/row-expander-demo.component';
import { FromSupportDemoComponent } from './from-support-demo/from-support-demo.component';

@NgModule({
  declarations: [
    DemoComponent,
    BasicDemoComponent,
    EditableDemoComponent,
    CustomTypesDemoComponent,
    PerRowDemoComponent,
    FilteringDemoComponent,
    RowExpanderDemoComponent,
    FromSupportDemoComponent
  ],
  imports: [
    AngularMaterialModule,
    CodeBlockComponent,
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
