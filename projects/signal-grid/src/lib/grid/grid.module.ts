import { ModuleWithProviders, NgModule } from '@angular/core';
import { TestDataService } from './test-data.service';
import { GridModuleConfig, SIGNAL_GRID_CELL_TYPES } from './registry/cell-type-config';
import { CellTypeRegistry, cellTypeRegistryFactory } from './registry/cell-type-registry';

@NgModule({
  exports: [],
  providers: [
    TestDataService,
    { provide: SIGNAL_GRID_CELL_TYPES, useValue: [], multi: true },
    { provide: CellTypeRegistry, useFactory: cellTypeRegistryFactory }
  ]
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
