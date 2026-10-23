import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoComponent } from '../demo/demo.component';
import { Router } from '@angular/router';
import { TestDataService } from '../../../../projects/signal-grid/src/lib/grid/test-data.service';
import { GridSampleData } from '../../../../projects/signal-grid/src/lib/grid/grid-sample-data';
import { Model } from '../../../../projects/signal-grid/src/lib/grid/models/model';
import {
  ColumnConfiguration,
  SignalGridFilterFormConfig
} from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnSchema } from '../../../../projects/signal-grid/src/lib/grid/models/column-schema';
import { DefaultRowExpanderComponent } from '../../../../projects/signal-grid/src/lib/grid/expander/default-row-expander.component';
import { signal, Type } from '@angular/core';
import { buildDemoColumns } from './demo-columns';

/** localStorage key for the demo's saved model — lets saves survive page reloads. */
const STORAGE_KEY = 'sg-demo-model';

@Component({
  selector: 'app-demo-grid',
  standalone: false,
  templateUrl: './demo-grid.component.html',
  styleUrls: ['./demo-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoGridComponent extends DemoComponent {
  columns: (ColumnConfiguration | ColumnSchema)[];
  model: GridSampleData[];
  originalModel: GridSampleData[];
  filterModel: Record<string, unknown> = {};

  /** Factory rows, kept so "Clear persisted" can restore them. */
  private readonly factoryData: GridSampleData[];

  /** Summary of the last save (JSON of the rows it changed), null = never saved. */
  readonly lastSave = signal<string | null>(null);

  /** Formly filter configuration with appropriate field types for each column */
  filterFormConfig: SignalGridFilterFormConfig = {
    fields: [
      {
        key: 'name',
        type: 'input',
        templateOptions: {
          label: 'Name',
          placeholder: 'Search by name...'
        }
      },
      {
        key: 'age',
        type: 'input',
        templateOptions: {
          label: 'Age',
          placeholder: 'Min age...'
        },
        parsers: [
          (value: any) => {
            const num = parseInt(value, 10);
            return Number.isNaN(num) ? undefined : num;
          }
        ]
      },
      {
        key: 'isRegistered',
        type: 'checkbox',
        templateOptions: {
          label: 'Registered only'
        }
      },
      {
        key: 'isActive',
        type: 'checkbox',
        templateOptions: {
          label: 'Active only'
        }
      }
    ],
    submitBtnText: 'Apply Filters',
    resetBtnText: 'Clear Filters'
  };

  constructor(_router: Router, gridTest: TestDataService) {
    super(_router);
    this.columns = [...gridTest.columns, ...buildDemoColumns()];
    this.factoryData = gridTest.data;
    this.model = gridTest.data;
    this.originalModel = [...gridTest.data];
    // Restore the last saved model, if any — saves survive page reloads.
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      try {
        const restored = JSON.parse(persisted) as GridSampleData[];
        this.model = restored;
        this.originalModel = [...restored];
        this.lastSave.set(
          `(restored from localStorage — ${restored.length} rows)\n` +
            JSON.stringify(restored.slice(0, 3), null, 2) +
            '\n…'
        );
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  onModelChange(model: Model[]): void {
    // Merged model with edits applied; emitted (debounced) while editing.
  }

  /** Handles save — persists to localStorage and reports the rows it changed. */
  onSave(savedModel: Model[]): void {
    const saved = [...savedModel] as GridSampleData[];
    // mergedModel() passes untouched rows through by identity, so an identity
    // difference against the pre-save model pinpoints exactly what changed.
    const edited = saved.filter((row, i) => row !== this.model[i]);
    this.originalModel = saved;
    this.model = saved;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    this.lastSave.set(
      JSON.stringify(
        {
          at: new Date().toISOString(),
          totalRows: saved.length,
          editedCount: edited.length,
          edited
        },
        null,
        2
      )
    );
  }

  /** Drops the persisted model and restores the factory rows. */
  clearPersisted(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.lastSave.set(null);
    this.model = [...this.factoryData];
    this.originalModel = [...this.factoryData];
    this.filterModel = {};
  }

  /** Handles reset — reverts to original model. */
  onReset(): void {
    this.model = [...this.originalModel];
  }

  /** Handles filter submission — applies filters to the model */
  onFilterSubmit(filterValue: Record<string, unknown>): void {
    this.filterModel = filterValue;
    // Pre-process filter values for faster comparison
    const prepped = this._prepFilter(filterValue);
    this.model = this.originalModel.filter(row =>
      this._matches(row as unknown as Record<string, unknown>, prepped)
    );
  }

  /** Resets filters and restores original model */
  resetFilters(): void {
    this.filterModel = {};
    this.model = [...this.originalModel];
  }

  /** Pre-lowercase string filters to avoid calling toLowerCase on every row */
  private _prepFilter(filter: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'string') {
        result[key] = value.toLowerCase();
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /** Checks if a row matches the current filter criteria */
  private _matches(row: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }
      const rowValue = row[key];
      if (typeof value === 'boolean') {
        if (value && rowValue !== true) return false;
      } else if (typeof value === 'number') {
        if (typeof rowValue !== 'number' || rowValue < value) return false;
      } else if (typeof value === 'string') {
        if (typeof rowValue !== 'string' || !rowValue.toLowerCase().includes(value as string))
          return false;
      }
    }
    return true;
  }

  reload(): void {
    this.originalModel = Array.from(
      { length: 10 },
      (_, index) =>
        new GridSampleData(
          index,
          `Reloaded-${index}`,
          index % 3 === 0,
          (Math.floor(Math.random() * 4) + 1) * 25,
          index % 2 === 0
        )
    );
    this.model = [...this.originalModel];
    this.filterModel = {};
  }

  /** Row expander configuration using the default JSON dump component. */
  expanderConfig: Type<unknown> = DefaultRowExpanderComponent;
}
