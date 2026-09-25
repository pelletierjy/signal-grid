import { ModuleWithProviders, NgModule } from '@angular/core';
import { GridComponent } from './grid/grid.component';
import { TestDataService } from './test-data.service';
import { HeaderComponent } from './header/header.component';
import { RowComponent } from './row/row.component';
import { FormsModule } from '@angular/forms';
import { CellComponent } from './cell/cell.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DynamicPipe } from './pipes/dynamic-pipe';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { CallbackRunnerModule } from '../shared/callback-runner/callback-runner.module';
import { BooleanCellComponent } from './cell/types/boolean-cell.component';
import { DefaultCellComponent } from './cell/types/default-cell.component';
import { NumberCellComponent } from './cell/types/number-cell.component';
import { StringCellComponent } from './cell/types/string-cell.component';
import { GridModuleConfig, SIGNAL_GRID_CELL_TYPES } from './registry/cell-type-config';
import { CellTypeRegistry, cellTypeRegistryFactory } from './registry/cell-type-registry';

@NgModule({
  declarations: [
    GridComponent,
    HeaderComponent,
    RowComponent,
    CellComponent,
    DynamicPipe,
    NumberCellComponent,
    StringCellComponent,
    BooleanCellComponent,
    DefaultCellComponent
  ],
  exports: [GridComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    MatMenuModule,
    ScrollingModule,
    MatAutocompleteModule,
    MatIconModule,
    MatInputModule,
    CallbackRunnerModule
  ],
  providers: [TestDataService]
})
export class GridModule {
  static forRoot(config: GridModuleConfig = {}): ModuleWithProviders<GridModule> {
    return {
      ngModule: GridModule,
      providers: [{ provide: SIGNAL_GRID_CELL_TYPES, useValue: config.types ?? [], multi: true }]
    };
  }

  static forChild(config: GridModuleConfig = {}): ModuleWithProviders<GridModule> {
    return {
      ngModule: GridModule,
      providers: [
        { provide: SIGNAL_GRID_CELL_TYPES, useValue: config.types ?? [], multi: true },
        { provide: CellTypeRegistry, useFactory: cellTypeRegistryFactory }
      ]
    };
  }
}
