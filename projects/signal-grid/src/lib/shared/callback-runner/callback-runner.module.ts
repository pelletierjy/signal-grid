import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallbackRunnerPipe } from './callback-runner.pipe';

@NgModule({
  declarations: [CallbackRunnerPipe],
  imports: [CommonModule],
  exports: [CallbackRunnerPipe]
})
export class CallbackRunnerModule {}
