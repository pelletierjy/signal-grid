import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { sampleRows } from '../docs-sample';

@Component({
  selector: 'app-docs-columns',
  standalone: false,
  template: `
    <h1>Columns</h1>
    <p class="lead">
      A column says which field to show, which cell type renders it, and whether it can be edited.
      Most settings can be a fixed value or a callback that runs for every row.
    </p>

    <h2>The builder</h2>
    <table>
      <tr>
        <th>Method</th>
        <th>What it does</th>
      </tr>
      @for (item of builder; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>{{ item.description }}</td>
      </tr>
      }
    </table>

    <h2>Schema objects</h2>
    <p>
      The <code>[columns]</code> input also accepts plain object literals — a
      <code>ColumnSchema</code>, the grid's equivalent of a Formly field config. Schemas are plain
      data (plus optional callbacks), so column sets can come from JSON or a server; the grid
      compiles them to <code>ColumnConfiguration</code> once when the input changes. Builder output
      and schema literals can be mixed freely in one array.
    </p>
    <app-code-block [code]="schemaSnippet" />

    <div class="note">
      A column's field is also the name of the form control behind it, so two columns on the same
      field show and edit the same value.
    </div>

    <h2>Settings the grid reads</h2>
    <table>
      <tr>
        <th>Setting</th>
        <th>Type</th>
        <th>Notes</th>
      </tr>
      @for (item of settings; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>
          <code>{{ item.type }}</code>
        </td>
        <td>{{ item.description }}</td>
      </tr>
      }
    </table>
    <p>
      <code>ColumnConfiguration</code> has more members than these. The grid does not use them yet.
    </p>

    <h2>Per-row callbacks</h2>
    <p>A callback receives a <code>CallbackParameter</code>:</p>
    <table>
      <tr>
        <th>Member</th>
        <th>Description</th>
      </tr>
      @for (item of callbackParameter; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>{{ item.description }}</td>
      </tr>
      }
    </table>
    <app-code-block [code]="callbackSnippet" />

    <h3>Live example</h3>
    <p>
      Names can only be edited in even rows. The status column shows a badge for active rows and the
      hatched default cell for the others.
    </p>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
  `,
  styleUrls: ['../docs-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnsPageComponent {
  rows = sampleRows();
  columns = [
    new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .withType('string')
      .editable(cb => cb.index % 2 === 0)
      .build('Name (even rows editable)'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType(cb => (cb.value ? 'status-badge' : 'default'))
      .withProps({ colors: { true: '#d6eadf' } })
      .build('Status')
  ];

  builder = [
    { name: 'withField(name)', description: 'The property of each row this column shows.' },
    {
      name: 'withType(name | callback)',
      description:
        'The cell type, as a string such as "number", "string", "boolean" or the name of a type you registered. A callback chooses it per row. Without a type the column shows the default cell.'
    },
    {
      name: 'withProps(object | callback)',
      description:
        'Settings for the cell type, for example the options of a select. A callback computes them per row.'
    },
    {
      name: 'editable(callback?)',
      description:
        'Makes cells editable. With no argument every row is editable, with a callback it decides per row. Without this call cells are read-only.'
    },
    { name: 'build(headerText)', description: 'Creates the ColumnConfiguration.' }
  ];

  settings = [
    { name: 'columnHeaderText', type: 'string', description: 'The header text, set by build().' },
    { name: 'fieldName', type: 'string', description: 'Set by withField().' },
    { name: 'type', type: 'string | (cb) => string', description: 'Set by withType().' },
    { name: 'props', type: 'object | (cb) => object', description: 'Set by withProps().' },
    { name: 'isEditable', type: '(cb) => boolean', description: 'Set by editable().' },
    {
      name: 'cellCssClass',
      type: '(cb) => string',
      description:
        'Not on the builder: set it on the built column. The class is added to the cell container, whatever the cell type.'
    }
  ];

  callbackParameter = [
    { name: 'value', description: 'The cell value of this row.' },
    { name: 'index', description: 'The row index.' },
    {
      name: 'formGroup',
      description:
        'The row\u2019s form group. Read other fields of the same row with formGroup.get("otherField").'
    },
    { name: 'fieldName()', description: 'The column field.' }
  ];

  callbackSnippet = `const status = new ColumnConfigurationBuilder()
  .withField('isActive')
  .withType(cb => (cb.value ? 'status-badge' : 'default'))
  .withProps(cb => ({ label: cb.value ? 'Active' : 'Inactive' }))
  .editable(cb => cb.index % 2 === 0)
  .build('Status');

// not on the builder: set it on the built column
status.cellCssClass = cb => (cb.value ? 'row-active' : '');`;

  schemaSnippet = `import { ColumnSchema } from '@jypsolution/signal-grid';

const columns: ColumnSchema[] = [
  { field: 'id', header: 'ID', type: 'number', width: 80 },
  { field: 'name', header: 'Name', type: 'string', editable: true, width: 180 },
  {
    field: 'isActive',
    header: 'Active',
    type: 'status-badge',
    props: { colors: { true: '#d6eadf' } },
    cssClass: cb => (cb.value ? 'row-active' : ''),
    wrappers: ['validation']
  }
];`;
}
