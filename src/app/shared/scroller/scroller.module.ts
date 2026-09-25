import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollerComponent } from './scroller.component';
import { AngularMaterialModule } from '../angular-material.module';

@NgModule({
  declarations: [ScrollerComponent],
  imports: [AngularMaterialModule, CommonModule],
  exports: [ScrollerComponent]
})
export class ScrollerModule {}
