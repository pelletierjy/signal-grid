import { InjectionToken, Type } from '@angular/core';
import type { BaseCellComponent } from '../cell/base-cell.component';
import type { BaseCellWrapper } from '../cell/wrappers/base-cell-wrapper';

export type CellTypeName = string;

export type CellProps = Record<string, unknown>;

export interface CellTypeConfig {
  name: CellTypeName;
  component: Type<BaseCellComponent>;
}

/** A wrapper component composed around a cell, selected by name. */
export interface CellWrapperConfig {
  name: CellTypeName;
  component: Type<BaseCellWrapper>;
}

export interface GridModuleConfig {
  types?: CellTypeConfig[];
  wrappers?: CellWrapperConfig[];
}

export const SIGNAL_GRID_CELL_TYPES = new InjectionToken<CellTypeConfig[][]>(
  'SIGNAL_GRID_CELL_TYPES'
);

export const SIGNAL_GRID_CELL_WRAPPERS = new InjectionToken<CellWrapperConfig[][]>(
  'SIGNAL_GRID_CELL_WRAPPERS'
);
