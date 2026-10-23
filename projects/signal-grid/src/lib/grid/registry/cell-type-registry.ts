import { inject, Injectable, Type } from '@angular/core';
import { BaseCellComponent } from '../cell/base-cell.component';
import { ActionsCellComponent } from '../cell/types/actions-cell.component';
import { BooleanCellComponent } from '../cell/types/boolean-cell.component';
import { DefaultCellComponent } from '../cell/types/default-cell.component';
import { NumberCellComponent } from '../cell/types/number-cell.component';
import { StringCellComponent } from '../cell/types/string-cell.component';
import { CellTypeConfig, CellTypeName, SIGNAL_GRID_CELL_TYPES } from './cell-type-config';

export const BUILT_IN_CELL_TYPES: CellTypeConfig[] = [
  { name: 'number', component: NumberCellComponent },
  { name: 'string', component: StringCellComponent },
  { name: 'boolean', component: BooleanCellComponent },
  { name: 'actions', component: ActionsCellComponent },
  { name: 'default', component: DefaultCellComponent }
];

export function cellTypeRegistryFactory(): CellTypeRegistry {
  const parent = inject(CellTypeRegistry, { skipSelf: true, optional: true });
  const levels = inject(SIGNAL_GRID_CELL_TYPES, { optional: true }) ?? [];
  return new CellTypeRegistry(parent, levels, parent ? [] : BUILT_IN_CELL_TYPES);
}

@Injectable({ providedIn: 'root', useFactory: cellTypeRegistryFactory })
export class CellTypeRegistry {
  private readonly _types = new Map<CellTypeName, Type<BaseCellComponent>>();
  private readonly _warned: Set<string>;

  constructor(
    private readonly _parent: CellTypeRegistry | null,
    levels: CellTypeConfig[][],
    builtIns: CellTypeConfig[] = []
  ) {
    this._warned = _parent ? _parent._warned : new Set<string>();
    builtIns.forEach(({ name, component }) => this._types.set(name, component));
    const registered = new Set<CellTypeName>();
    levels.forEach(level =>
      level.forEach(({ name, component }) => {
        if (registered.has(name)) {
          console.warn(
            `signal-grid: cell type '${name}' is registered more than once. The last one wins.`
          );
        }
        registered.add(name);
        this._types.set(name, component);
      })
    );
  }

  resolve(name: CellTypeName): Type<BaseCellComponent> | undefined {
    return this._types.get(name) ?? this._parent?.resolve(name);
  }

  warnUnknown(name: CellTypeName, fieldName: string): void {
    const key = `${name}|${fieldName}`;
    if (this._warned.has(key)) {
      return;
    }
    this._warned.add(key);
    console.warn(
      `signal-grid: cell type '${name}' is not registered (column '${fieldName}'). Showing a read-only string cell.`
    );
  }
}
