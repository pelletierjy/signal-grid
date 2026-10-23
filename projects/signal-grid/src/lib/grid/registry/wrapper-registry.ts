import { inject, Injectable, Type } from '@angular/core';
import type { BaseCellWrapper } from '../cell/wrappers/base-cell-wrapper';
import {
  CellWrapperConfig,
  CellTypeName,
  SIGNAL_GRID_CELL_WRAPPERS
} from './cell-type-config';

/**
 * Hierarchical registry of cell wrappers, mirroring {@link CellTypeRegistry}:
 * wrappers registered closer to the grid (forChild) override outer ones, and a
 * missing name renders the cell without a wrapper plus one warning.
 */
@Injectable({ providedIn: 'root', useFactory: cellWrapperRegistryFactory })
export class CellWrapperRegistry {
  private readonly _types = new Map<CellTypeName, Type<BaseCellWrapper>>();
  private readonly _warned: Set<string>;

  constructor(
    private readonly _parent: CellWrapperRegistry | null,
    levels: CellWrapperConfig[][]
  ) {
    this._warned = _parent ? _parent._warned : new Set<string>();
    const registered = new Set<CellTypeName>();
    levels.forEach(level =>
      level.forEach(({ name, component }) => {
        if (registered.has(name)) {
          console.warn(
            `signal-grid: cell wrapper '${name}' is registered more than once. The last one wins.`
          );
        }
        registered.add(name);
        this._types.set(name, component);
      })
    );
  }

  resolve(name: CellTypeName): Type<BaseCellWrapper> | undefined {
    return this._types.get(name) ?? this._parent?.resolve(name);
  }

  warnUnknown(name: CellTypeName, fieldName: string): void {
    const key = `${name}|${fieldName}`;
    if (this._warned.has(key)) {
      return;
    }
    this._warned.add(key);
    console.warn(
      `signal-grid: cell wrapper '${name}' is not registered (column '${fieldName}'). Rendering the cell without it.`
    );
  }
}

export function cellWrapperRegistryFactory(): CellWrapperRegistry {
  const parent = inject(CellWrapperRegistry, { skipSelf: true, optional: true });
  const levels = inject(SIGNAL_GRID_CELL_WRAPPERS, { optional: true }) ?? [];
  return new CellWrapperRegistry(parent, levels);
}
