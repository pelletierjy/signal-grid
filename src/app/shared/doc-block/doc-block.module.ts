import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocBlockComponent } from './doc-block.component';

@NgModule({
  declarations: [DocBlockComponent],
  imports: [CommonModule],
  exports: [DocBlockComponent]
})
export class DocBlockModule {}
