import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { basicColumns, sampleRows } from '../docs-sample';

@Component({
  selector: 'app-docs-getting-started',
  standalone: false,
  template: `
    <h1>Getting started</h1>
    <p class="lead">
      SignalGrid (&#64;jypsolution/signal-grid) is an Angular grid with editable cells, a registry
      of cell types, and a styling API built on CSS custom properties.
    </p>

    <h2>1. Import the module</h2>
    <p>
      Import <code>GridModule</code> where you use the grid. Use <code>forRoot</code> when you also
      want to register your own cell types (see <a routerLink="/docs/cell-types">Cell types</a>).
    </p>
    <app-code-block [code]="importSnippet" />

    <h2>2. Define the columns</h2>
    <p>
      Columns are plain <code>ColumnSchema</code> objects or built with
      <code>ColumnConfigurationBuilder</code> — the <code>[columns]</code> input accepts both, mixed
      freely. <code>field</code> names the property of each row, <code>type</code> picks the cell
      type from the registry. Cells are read-only unless the column is <code>editable</code>. More
      in <a routerLink="/docs/columns">Columns</a>.
    </p>
    <app-code-block [code]="columnsSnippet" />

    <h2>3. Use the component</h2>
    <app-code-block [code]="templateSnippet" />
    <table>
      <tr>
        <th>Name</th>
        <th>Kind</th>
        <th>Description</th>
      </tr>
      @for (item of api; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>{{ item.kind }}</td>
        <td>{{ item.description }}</td>
      </tr>
      }
    </table>

    <h2>Live example</h2>
    <p>Edit a name or tick a box. The output below shows what <code>modelChange</code> emits.</p>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" (modelChange)="changed.set($event)" />
    </div>
    <p class="output">modelChange: {{ changedJson() }}</p>

    <div class="note">
      The grid never changes the array you pass in. It works on a copy and reports edits through
      <code>modelChange</code>. Rows are identified by <strong>object identity</strong>, so
      filtering and sorting keep unsaved edits attached to the right rows — replace row objects
      (not fields in place) to load new data.
    </div>
  `,
  styleUrls: ['../docs-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GettingStartedPageComponent {
  rows = sampleRows();
  columns = basicColumns();
  changed = signal<unknown>(null);
  changedJson = () => (this.changed() ? JSON.stringify(this.changed()) : 'nothing yet');

  importSnippet = `import { GridModule } from '@jypsolution/signal-grid';

@NgModule({
  imports: [
    // plain import: the built-in cell types only
    GridModule
    // or, to register your own cell types as well:
    // GridModule.forRoot({ types: [{ name: 'status-badge', component: StatusBadgeCellComponent }] })
  ]
})
export class AppModule {}`;

  columnsSnippet = `// plain schema objects…
const columns = [
  { field: 'id', header: 'ID', type: 'number' },
  { field: 'name', header: 'Name', type: 'string', editable: true },
  { field: 'isActive', header: 'Active', type: 'boolean', editable: true }
];

// …or the builder, mixed freely in one array
import { ColumnConfigurationBuilder } from '@jypsolution/signal-grid';

const extra = new ColumnConfigurationBuilder().withField('age').withType('number').editable().build('Age');`;

  templateSnippet = `<signal-grid
  [model]="rows"
  [columns]="columns"
  [includeRowExpander]="false"
  (modelChange)="onModelChange($event)"></signal-grid>`;

  api = [
    {
      name: 'model',
      kind: 'input, required',
      description:
        'The rows: an array of objects. Each column reads the property named by its field.'
    },
    {
      name: 'columns',
      kind: 'input, required',
      description:
        'An array of ColumnSchema objects and/or ColumnConfigurations — usually built with ColumnConfigurationBuilder or written as literals.'
    },
    {
      name: 'includeRowExpander',
      kind: 'input, default false',
      description: 'Adds a "+" column that expands a row.'
    },
    {
      name: 'modelChange',
      kind: 'output',
      description:
        'The full array of rows with edits applied, emitted (debounced) while editing. It contains every field, including read-only ones.'
    }
  ];
}
