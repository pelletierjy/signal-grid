import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { sampleRows } from '../demo-data';

/**
 * Showcases custom cell types registered with the grid: status-badge,
 * toggle-cell and select-cell.
 *
 * These types are registered at the application root in
 * `app.module.ts` with `GridModule.forRoot({ types: DEMO_CELL_TYPES })`.
 */
@Component({
  selector: 'app-custom-types-demo',
  standalone: false,
  template: `
    <h1>Custom cell types</h1>
    <p class="lead">
      Built-in types cover simple values, but you can register your own components and reference
      them by name the same way Formly maps field types.
    </p>

    <h2>Registration</h2>
    <p>
      Register once in a module with <code>GridModule.forRoot</code> (app-wide) or
      <code>forChild</code> (feature-scoped). The name becomes the string you pass to
      <code>withType()</code>.
    </p>
    <app-code-block [code]="registerSnippet" />

    <h2>Props</h2>
    <p>
      Props let one component serve many columns. The
      <code>status-badge</code> below reads its colour map from <code>withProps()</code>; the two
      <code>select-cell</code> columns share one component but receive different option lists
      through props.
    </p>
    <app-code-block [code]="propsSnippet" />

    <h2>Live example</h2>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTypesDemoComponent {
  rows = sampleRows();

  columns = [
    new ColumnConfigurationBuilder().withField('name').build('Name'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('status-badge')
      .withProps({ colors: { true: '#d6eadf', false: '#f1d4d4' } })
      .build('Status badge'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('toggle-cell')
      .editable()
      .build('Toggle'),
    new ColumnConfigurationBuilder()
      .withField('age')
      .withType('select-cell')
      .withProps({ options: [25, 50, 75, 100] })
      .editable()
      .build('Select (ages)'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .withType('select-cell')
      .withProps(cb => ({ options: [cb.value, 'Alpha', 'Beta'] }))
      .editable()
      .build('Select (names)')
  ];

  registerSnippet = `// app.module.ts
import { GridModule } from '@jypsolution/signal-grid';

GridModule.forRoot({
  types: [
    { name: 'status-badge', component: StatusBadgeCellComponent },
    { name: 'toggle-cell', component: ToggleCellComponent },
    { name: 'select-cell', component: SelectCellComponent }
  ]
})`;

  propsSnippet = `new ColumnConfigurationBuilder()
  .withField('isActive')
  .withType('status-badge')
  .withProps({ colors: { true: '#d6eadf', false: '#f1d4d4' } })
  .build('Status');

// same component, different options
new ColumnConfigurationBuilder()
  .withField('age')
  .withType('select-cell')
  .withProps({ options: [25, 50, 75, 100] })
  .editable()
  .build('Age');`;
}
