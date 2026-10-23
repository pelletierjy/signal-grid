import { ModuleWithProviders, NgModule } from '@angular/core';
import { TestDataService } from './test-data.service';
import { GridModuleConfig, SIGNAL_GRID_CELL_TYPES, SIGNAL_GRID_CELL_WRAPPERS } from './registry/cell-type-config';
import { CellTypeRegistry, cellTypeRegistryFactory } from './registry/cell-type-registry';
import { CellWrapperRegistry, cellWrapperRegistryFactory } from './registry/wrapper-registry';

@NgModule({
  exports: [],
  providers: [
    TestDataService,
    { provide: SIGNAL_GRID_CELL_TYPES, useValue: [], multi: true },
    { provide: SIGNAL_GRID_CELL_WRAPPERS, useValue: [], multi: true },
    { provide: CellTypeRegistry, useFactory: cellTypeRegistryFactory },
    { provide: CellWrapperRegistry, useFactory: cellWrapperRegistryFactory }
  ]
})
export class GridModule {
  static forRoot(config: GridModuleConfig = {}): ModuleWithProviders<GridModule> {
    return {
      ngModule: GridModule,
      providers: [
        { provide: SIGNAL_GRID_CELL_TYPES, useValue: config.types ?? [], multi: true },
        { provide: SIGNAL_GRID_CELL_WRAPPERS, useValue: config.wrappers ?? [], multi: true }
      ]
    };
  }

  static forChild(config: GridModuleConfig = {}): ModuleWithProviders<GridModule> {
    return {
      ngModule: GridModule,
      providers: [
        { provide: SIGNAL_GRID_CELL_TYPES, useValue: config.types ?? [], multi: true },
        { provide: SIGNAL_GRID_CELL_WRAPPERS, useValue: config.wrappers ?? [], multi: true },
        { provide: CellTypeRegistry, useFactory: cellTypeRegistryFactory },
        { provide: CellWrapperRegistry, useFactory: cellWrapperRegistryFactory }
      ]
    };
  }
}
