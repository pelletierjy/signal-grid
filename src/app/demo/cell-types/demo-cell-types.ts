import { CellTypeConfig } from '../../../../projects/signal-grid/src/lib/grid/registry/cell-type-config';
import { SelectCellComponent } from './select-cell.component';
import { StatusBadgeCellComponent } from './status-badge-cell.component';
import { ToggleCellComponent } from './toggle-cell.component';

export const DEMO_CELL_TYPES: CellTypeConfig[] = [
  { name: 'status-badge', component: StatusBadgeCellComponent },
  { name: 'select-cell', component: SelectCellComponent },
  { name: 'toggle-cell', component: ToggleCellComponent }
];
