import { ChangeDetectionStrategy, Component, signal, Type } from '@angular/core';
import { Router } from '@angular/router';
import { TestDataService } from '../../../../projects/signal-grid/src/lib/grid/test-data.service';
import { GridSampleData } from '../../../../projects/signal-grid/src/lib/grid/grid-sample-data';
import { Model } from '../../../../projects/signal-grid/src/lib/grid/models/model';
import { SignalGridFilterFormConfig } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnSchema } from '../../../../projects/signal-grid/src/lib/grid/models/column-schema';
import { ColumnConfiguration } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { DefaultRowExpanderComponent } from '../../../../projects/signal-grid/src/lib/grid/expander/default-row-expander.component';

/** localStorage key for the demo's saved model — lets saves survive page reloads. */
const STORAGE_KEY = 'sg-demo-model';

const statusColors = { true: '#d6eadf', false: '#f1d4d4' };

/**
 * A realistic, full-featured example that mixes everything the grid offers:
 * built-in and custom cell types, per-row callbacks, a Formly filter bar,
 * expandable rows, editing with localStorage persistence, and plain schema
 * literals mixed with builder columns.
 */
@Component({
  selector: 'app-from-support-demo',
  standalone: false,
  template: `
    <h1>From support</h1>
    <p class="lead">
      A realistic help-desk view built with every major grid feature: custom cell types, per-row
      logic, filtering, row expanders, editable cells, and mixed builder/schema columns.
    </p>

    <h2>What this demo shows</h2>
    <ul>
      <li>
        <strong>Custom types</strong> — <code>status-badge</code>, <code>toggle-cell</code> and
        <code>select-cell</code> registered at the root module.
      </li>
      <li>
        <strong>Per-row logic</strong> — the <em>Name (select)</em> column offers the current value
        + two extras. The <em>Status</em> column swaps between a badge and plain text depending on
        <code>isActive</code>.
      </li>
      <li>
        <strong>Mixed configuration styles</strong> — most columns are built with
        <code>ColumnConfigurationBuilder</code>, but two are plain
        <code>ColumnSchema</code> literals.
      </li>
      <li>
        <strong>Filtering</strong> — a Formly form above the grid lets you filter by name, minimum
        age, registered status, and active status.
      </li>
      <li><strong>Row expander</strong> — click "+" to see the raw row data as JSON.</li>
      <li>
        <strong>Persisted edits</strong> — press Save and the model is written to
        <code>localStorage</code>; it is restored on the next visit.
      </li>
    </ul>

    <h2>Column setup</h2>
    <app-code-block [code]="columnsSnippet" />

    <h2>Filter configuration</h2>
    <app-code-block [code]="filterSnippet" />

    <h2>Template</h2>
    <app-code-block [code]="templateSnippet" />

    <h2>Live example</h2>
    <p>
      Edit cells, apply filters, expand rows, then press Save. The JSON panel below shows exactly
      what <code>saveChanges</code> emitted.
    </p>
    <div class="demo">
      <signal-grid
        [model]="model"
        [columns]="columns"
        [rowExpanderConfig]="expanderConfig"
        [filterFormConfig]="filterFormConfig"
        (modelChange)="onModelChange($event)"
        (filterSubmit)="onFilterSubmit($event)"
        (saveChanges)="onSave($event)"
        (resetChanges)="onReset()">
      </signal-grid>
    </div>

    <div class="save-panel">
      <div class="save-panel__head">
        <strong>Last save</strong>
        @if (lastSave()) {
        <button mat-button color="accent" (click)="clearPersisted()">Clear persisted</button>
        }
      </div>
      @if (lastSave()) {
      <pre class="save-panel__body">{{ lastSave() }}</pre>
      } @else {
      <p class="save-panel__empty">
        Nothing saved yet — edit a cell and press Save. Saves persist across reloads (localStorage).
      </p>
      }
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FromSupportDemoComponent {
  columns: (ColumnConfiguration | ColumnSchema)[];
  model: GridSampleData[];
  originalModel: GridSampleData[];
  filterModel: Record<string, unknown> = {};

  /** Factory rows, kept so "Clear persisted" can restore them. */
  private readonly factoryData: GridSampleData[];

  /** Summary of the last save (JSON of the rows it changed), null = never saved. */
  readonly lastSave = signal<string | null>(null);

  /** Row expander configuration using the default JSON dump component. */
  expanderConfig: Type<unknown> = DefaultRowExpanderComponent;

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
    this.columns = [
      ...gridTest.columns,
      new ColumnConfigurationBuilder()
        .withField('isRegistered')
        .width(100)
        .withType('status-badge')
        .withProps({ colors: statusColors })
        .build('Status badge'),
      new ColumnConfigurationBuilder()
        .withField('age')
        .width(100)
        .editable()
        .withType('select-cell')
        .withProps({ options: [25, 50, 75, 100] })
        .build('Age (select)'),
      new ColumnConfigurationBuilder()
        .withField('name')
        .width(180)
        .editable()
        .withType('select-cell')
        .withProps(cb => ({ options: [cb.value, 'Alpha', 'Beta'] }))
        .build('Name (select)'),
      new ColumnConfigurationBuilder()
        .withField('isRegistered')
        .width(100)
        .withType('status-badge')
        .withProps({ colors: statusColors })
        .build('Badge + css class'),
      // Plain schema literals — same result as the builder above.
      { field: 'id', header: 'No type', width: 80 },
      { field: 'name', header: 'Unknown type', width: 180, type: 'does-not-exist' },
      new ColumnConfigurationBuilder()
        .withField('isActive')
        .width(100)
        .withType('toggle-cell')
        .editable(cb => cb.index % 3 !== 0)
        .build('Toggle'),
      new ColumnConfigurationBuilder()
        .withField('name')
        .width(180)
        // cb.formGroup is the *row's* group: other fields of the same row.
        .withType(cb => (cb.formGroup.get('isActive')?.value ? 'status-badge' : 'string'))
        .build('Per-row type'),
      new ColumnConfigurationBuilder()
        .withField('id')
        .width(80)
        .withType('eager-cell')
        .build('Eager type')
    ];

    // Apply highlight class on the 'Badge + css class' column
    const highlighted = this.columns[4] as ColumnConfiguration;
    highlighted.cellCssClass = () => 'demo-highlight';

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

  onModelChange(_model: Model[]): void {
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

  columnsSnippet = `const statusColors = { true: '#d6eadf', false: '#f1d4d4' };

const columns = [
  // builder columns
  new ColumnConfigurationBuilder()
    .withField('isRegistered')
    .width(100)
    .withType('status-badge')
    .withProps({ colors: statusColors })
    .build('Status badge'),

  new ColumnConfigurationBuilder()
    .withField('age')
    .width(100)
    .editable()
    .withType('select-cell')
    .withProps({ options: [25, 50, 75, 100] })
    .build('Age (select)'),

  // plain schema literals can be mixed freely
  { field: 'id', header: 'No type', width: 80 },
  { field: 'name', header: 'Unknown type', width: 180, type: 'does-not-exist' },

  // per-row type callback
  new ColumnConfigurationBuilder()
    .withField('name')
    .width(180)
    .withType(cb => (cb.formGroup.get('isActive')?.value ? 'status-badge' : 'string'))
    .build('Per-row type')
];`;

  filterSnippet = `const filterFormConfig: SignalGridFilterFormConfig = {
  fields: [
    { key: 'name', type: 'input', templateOptions: { label: 'Name' } },
    {
      key: 'age',
      type: 'input',
      templateOptions: { label: 'Age', placeholder: 'Min age...' },
      parsers: [(value: any) => {
        const num = parseInt(value, 10);
        return Number.isNaN(num) ? undefined : num;
      }]
    },
    { key: 'isRegistered', type: 'checkbox', templateOptions: { label: 'Registered only' } },
    { key: 'isActive', type: 'checkbox', templateOptions: { label: 'Active only' } }
  ],
  submitBtnText: 'Apply Filters',
  resetBtnText: 'Clear Filters'
};`;

  templateSnippet = `<signal-grid
  [model]="model"
  [columns]="columns"
  [rowExpanderConfig]="expanderConfig"
  [filterFormConfig]="filterFormConfig"
  (modelChange)="onModelChange($event)"
  (filterSubmit)="onFilterSubmit($event)"
  (saveChanges)="onSave($event)"
  (resetChanges)="onReset()"></signal-grid>`;
}
