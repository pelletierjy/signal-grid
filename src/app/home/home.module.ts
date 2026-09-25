import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AngularMaterialModule } from '../shared/angular-material.module';
import { DuoModule } from '../shared/duo/duo.module';
import { HeroModule } from '../shared/hero/hero.module';
import { HomeComponent } from './home/home.component';
import { HomeRoutingModule } from './home-routing.module';
import { ScrollerModule } from '../shared/scroller/scroller.module';
import { GridModule } from 'projects/signal-grid/src/lib/grid/grid.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    AngularMaterialModule,
    CommonModule,
    DuoModule,
    FormsModule,
    HeroModule,
    HomeRoutingModule,
    ScrollerModule,
    GridModule
  ]
})
export class HomeModule {}
