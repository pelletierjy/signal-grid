import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from './shared/angular-material.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DemoModule } from './demo/demo.module';
import { DocsModule } from './docs/docs.module';
import { DocBlockModule } from './shared/doc-block/doc-block.module';
import { DuoModule } from './shared/duo/duo.module';
import { HeaderModule } from './header/header.module';
import { HeroModule } from './shared/hero/hero.module';
import { HomeModule } from 'src/app/home/home.module';
import { ScrollerModule } from './shared/scroller/scroller.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { GridModule } from 'projects/signal-grid/src/lib/grid/grid.module';
import { DEMO_CELL_TYPES } from './demo/cell-types/demo-cell-types';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AngularMaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DemoModule,
    DocsModule,
    DocBlockModule,
    DuoModule,
    FormsModule,
    HeaderModule,
    HeroModule,
    HomeModule,
    HttpClientModule,
    ScrollerModule,
    GridModule.forRoot({ types: DEMO_CELL_TYPES })
  ],
  providers: [
    Location,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
