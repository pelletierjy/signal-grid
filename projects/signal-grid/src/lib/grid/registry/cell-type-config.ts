import { InjectionToken, Type } from '@angular/core';
import type { BaseCellComponent } from '../cell/base-cell.component';

export type CellTypeName = string;

export type CellProps = Record<string, unknown>;

export interface CellTypeConfig {
  name: CellTypeName;
  component: Type<BaseCellComponent>;
}

export interface GridModuleConfig {
  types?: CellTypeConfig[];
}

export const SIGNAL_GRID_CELL_TYPES = new InjectionToken<CellTypeConfig[][]>(
  'SIGNAL_GRID_CELL_TYPES'
);
