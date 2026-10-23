import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { sampleRows } from '../demo-data';

/**
 * Demonstrates per-row callbacks: editable, type, props and cellCssClass
 * can all be functions that receive a CallbackParameter and decide per row.
 */
@Component({
  selector: 'app-per-row-demo',
  standalone: false,
  template: `
    <h1>Per-row logic</h1>
    <p class="lead">
      Most column settings accept either a fixed value or a callback that runs for every row. Use
      this to make cells editable only in certain rows, choose a different cell type depending on
      data, or highlight rows conditionally.
    </p>

    <h2>CallbackParameter</h2>
    <table>
      <tr>
        <th>Member</th>
        <th>Description</th>
      </tr>
      <tr>
        <td><code>value</code></td>
        <td>The cell value of this row.</td>
      </tr>
      <tr>
        <td><code>index</code></td>
        <td>The row index.</td>
      </tr>
      <tr>
        <td><code>formGroup</code></td>
        <td>The row's form group — read other fields with <code>formGroup.get('field')</code>.</td>
      </tr>
      <tr>
        <td><code>fieldName()</code></td>
        <td>The column field name.</td>
      </tr>
    </table>

    <h2>Examples</h2>
    <app-code-block [code]="snippet" />

    <div class="note">
      <code>cellCssClass</code> is set on the built column, not through the builder. The class is
      added to the cell container regardless of which cell type renders.
    </div>

    <h2>Live example</h2>
    <p>
      Even rows are editable. The <strong>Type</strong> column shows a badge when
      <code>isActive</code> is true and falls back to plain text otherwise. The
      <strong>Name</strong> column is highlighted when <code>isRegistered</code> is true.
    </p>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerRowDemoComponent {
  rows = sampleRows();

  columns = [
    new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .withType('string')
      .editable(cb => cb.index % 2 === 0)
      .build('Name (even rows editable)'),
    new ColumnConfigurationBuilder()
      .withField('isRegistered')
      .withType('boolean')
      .build('Registered'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType(cb => (cb.value ? 'status-badge' : 'string'))
      .withProps(cb => (cb.value ? { colors: { true: '#d6eadf' } } : {}))
      .build('Type')
  ];

  constructor() {
    // cellCssClass is set on the built column after construction
    const nameCol = this.columns[1];
    nameCol.cellCssClass = cb => (cb.formGroup.get('isRegistered')?.value ? 'demo-highlight' : '');
  }

  snippet = `// editable only for even rows
new ColumnConfigurationBuilder()
  .withField('name')
  .withType('string')
  .editable(cb => cb.index % 2 === 0)
  .build('Name');

// choose cell type per row
new ColumnConfigurationBuilder()
  .withField('isActive')
  .withType(cb => (cb.value ? 'status-badge' : 'string'))
  .build('Status');

// read another field of the same row
const col = new ColumnConfigurationBuilder()
  .withField('name')
  .withType('string')
  .build('Name');

col.cellCssClass = cb =>
  (cb.formGroup.get('isRegistered')?.value ? 'highlight' : '');`;
}
