import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { sampleRows } from '../docs-sample';

@Component({
  selector: 'app-docs-cell-types',
  standalone: false,
  template: `
    <h1>Cell types</h1>
    <p class="lead">
      A column's <code>type</code> is a plain string. The grid looks the string up in a registry of
      names and components, the same way Formly maps field types.
    </p>

    <h2>Built-in types</h2>
    <p>These are always available.</p>
    <table>
      <tr>
        <th>Name</th>
        <th>Editable</th>
        <th>Read-only</th>
      </tr>
      @for (item of builtIns; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>{{ item.editable }}</td>
        <td>{{ item.readOnly }}</td>
      </tr>
      }
    </table>

    <h2>Registering your own</h2>
    <app-code-block [code]="registerSnippet" />
    <ul>
      <li>A feature module adds to the types registered above it.</li>
      <li>
        Registering a name again replaces the earlier component for the grids below that module. You
        can replace a built-in this way.
      </li>
      <li>Registering the same name twice in one list keeps the last one and logs a warning.</li>
      <li>
        A name nobody registered shows the value as read-only text and logs one warning for each
        name and field. The grid keeps working.
      </li>
    </ul>

    <h2>Wrappers</h2>
    <p>
      A column can declare <code>wrappers: ['name']</code> — component names resolved through a
      second registry, the same way Formly composes wrappers around a field. The grid creates the
      wrapper chain once per cell and inserts the cell (or the next wrapper) into the anchor your
      wrapper template provides:
    </p>
    <app-code-block [code]="wrapperSnippet" />
    <ul>
      <li>
        Register with
        <code>GridModule.forRoot({{ '{' }} wrappers: [...] {{ '}' }})</code>.
      </li>
      <li>
        Extend <code>BaseCellWrapper</code>: you get <code>column()</code>, <code>rowKey()</code>,
        <code>rowGroup()</code> and <code>rowInvalid()</code> for validation messages and the like.
      </li>
      <li>Wrappers run outermost-first in the order listed on the column.</li>
    </ul>

    <h2>Writing a cell type</h2>
    <p>Extend <code>BaseCellComponent</code>. It already has everything a cell needs:</p>
    <table>
      <tr>
        <th>Member</th>
        <th>Description</th>
      </tr>
      @for (item of members; track item.name) {
      <tr>
        <td>
          <code>{{ item.name }}</code>
        </td>
        <td>{{ item.description }}</td>
      </tr>
      }
    </table>
    <app-code-block [code]="toggleSnippet" />
    <p>Props make one type reusable. This select reads its options from the column:</p>
    <app-code-block [code]="selectSnippet" />

    <h3>Rules</h3>
    <ul>
      <li>
        Write values with <code>setValue()</code>. It ignores the write while the cell is read-only
        and marks the row as changed. Writing to <code>formControl()</code> directly skips that
        check.
      </li>
      <li>
        Do not disable the form control. Columns on the same field share it, so render the read-only
        state yourself.
      </li>
      <li>
        Avoid <code>[formControl]</code> in a cell. Each binding revalidates the whole grid form,
        which is slow with thousands of rows. Bind <code>[value]</code> and call
        <code>setValue()</code> instead.
      </li>
      <li>
        Do not apply <code>cellCssClass</code> yourself. The grid wraps your component in a
        container that already does.
      </li>
      <li>
        Take colors from the host's tokens or the grid's properties and let text inherit its color,
        so the cell follows the theme (see <a routerLink="/docs/styling">Styling</a>).
      </li>
      <li>The component can be standalone. If it is not, declare it in a module as usual.</li>
    </ul>

    <h2>Live example</h2>
    <p>
      This site registers <code>status-badge</code>, <code>select-cell</code> and
      <code>toggle-cell</code> with <code>GridModule.forRoot</code>. The two select columns share
      one type and get different options through <code>props</code>.
    </p>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
  `,
  styleUrls: ['../docs-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellTypesPageComponent {
  rows = sampleRows();
  columns = [
    new ColumnConfigurationBuilder().withField('name').build('Name (no type)'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('status-badge')
      .withProps({ colors: { true: '#d6eadf', false: '#f1d4d4' } })
      .build('status-badge'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('toggle-cell')
      .editable()
      .build('toggle-cell'),
    new ColumnConfigurationBuilder()
      .withField('age')
      .withType('select-cell')
      .withProps({ options: [25, 50, 75, 100] })
      .editable()
      .build('select-cell (ages)'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .withType('select-cell')
      .withProps(cb => ({ options: [cb.value, 'Alpha', 'Beta'] }))
      .editable()
      .build('select-cell (names)')
  ];

  builtIns = [
    { name: 'number', editable: 'Number input', readOnly: 'Text' },
    { name: 'string', editable: 'Text input', readOnly: 'Text' },
    { name: 'boolean', editable: 'Checkbox', readOnly: 'Disabled checkbox' },
    {
      name: 'default',
      editable: 'Used when a column has no type: an empty grey cell with hatch lines',
      readOnly: 'Same'
    }
  ];

  members = [
    {
      name: 'columns, column, rowKey, rowIndex',
      description: 'The inputs the grid gives every cell. rowKey identifies the row object.'
    },
    {
      name: 'value()',
      description: 'The current cell value. It updates when the row\u2019s form control changes.'
    },
    { name: 'isEditable()', description: 'Whether this row of the column is editable.' },
    { name: 'props()', description: 'The column props for this row, or an empty object.' },
    {
      name: 'setValue(value)',
      description: 'Writes a new value, only while the cell is editable.'
    },
    {
      name: 'formControl()',
      description: 'The control behind the cell, inside this row\u2019s group.'
    },
    {
      name: 'rowGroup()',
      description:
        'The form group of this row, to read the other fields. Rows scrolled out of the viewport have no group.'
    },
    {
      name: 'callbackParameter()',
      description: 'The CallbackParameter the column callbacks receive.'
    }
  ];

  registerSnippet = `// app.module.ts: available everywhere
GridModule.forRoot({
  types: [{ name: 'status-badge', component: StatusBadgeCellComponent }],
  wrappers: [{ name: 'validation', component: ValidationWrapperComponent }]
})

// lazy-loaded feature module: adds to the above and can override it for this module only
GridModule.forChild({ types: [{ name: 'boolean', component: YesNoCellComponent }] })`;

  wrapperSnippet = `@Component({
  selector: 'app-validation-wrapper',
  standalone: true,
  template: \`
    <div class="cell-with-error" [class.invalid]="rowInvalid()">
      <!-- the cell (or the next wrapper) renders here -->
      <ng-container [sgWrapperHost]="host()"></ng-container>
      @if (rowInvalid()) {
      <span class="error">invalid</span>
      }
    </div>
  \`
})
export class ValidationWrapperComponent extends BaseCellWrapper {}

// column:
{ field: 'age', type: 'number', editable: true, wrappers: ['validation'] }`;

  toggleSnippet = `@Component({
  selector: 'app-toggle-cell',
  standalone: true,
  template: \`
    <button type="button" [disabled]="!isEditable()" (click)="setValue(!value())">
      {{ value() ? 'ON' : 'OFF' }}
    </button>
  \`
})
export class ToggleCellComponent extends BaseCellComponent {}`;

  selectSnippet = `template: \`
  @if (isEditable()) {
    <mat-select [value]="value()" (selectionChange)="setValue($event.value)">
      @for (option of props()['options'] ?? []; track option) {
        <mat-option [value]="option">{{ option }}</mat-option>
      }
    </mat-select>
  } @else {
    {{ value() }}
  }
\``;
}
