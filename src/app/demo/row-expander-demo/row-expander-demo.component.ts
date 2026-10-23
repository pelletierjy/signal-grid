import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { DefaultRowExpanderComponent } from '../../../../projects/signal-grid/src/lib/grid/expander/default-row-expander.component';
import { sampleRows } from '../demo-data';

/**
 * Shows how to enable the row expander. The expander column renders a "+" button
 * in every row; clicking it expands the row and instantiates the configured
 * component inside the row.
 */
@Component({
  selector: 'app-row-expander-demo',
  standalone: false,
  template: `
    <h1>Row expander</h1>
    <p class="lead">
      Pass a component class to <code>[rowExpanderConfig]</code> and the grid adds an expander
      column. Clicking "+" mounts your component inside that row.
    </p>

    <h2>Expander component</h2>
    <p>
      The easiest choice is the built-in <code>DefaultRowExpanderComponent</code>, which simply
      JSON-stringifies the row. You can write your own by reading the row data through any input you
      declare — the grid sets the same <code>columns</code>, <code>column</code>,
      <code>rowKey</code> and <code>rowIndex</code> inputs it gives to cells.
    </p>
    <app-code-block [code]="expanderSnippet" />

    <h2>Enabling the expander</h2>
    <app-code-block [code]="templateSnippet" />

    <h2>Live example</h2>
    <p>Click the "+" button on any row to see the row data as JSON.</p>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" [rowExpanderConfig]="expanderConfig" />
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowExpanderDemoComponent {
  rows = sampleRows();

  columns = [
    new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
    new ColumnConfigurationBuilder().withField('name').withType('string').build('Name'),
    new ColumnConfigurationBuilder().withField('age').withType('number').build('Age'),
    new ColumnConfigurationBuilder().withField('isActive').withType('boolean').build('Active')
  ];

  expanderConfig = DefaultRowExpanderComponent;

  expanderSnippet = `import { DefaultRowExpanderComponent } from '@jypsolution/signal-grid';

// or write your own:
@Component({
  selector: 'app-detail',
  standalone: true,
  template: '<pre>{{ row | json }}</pre>'
})
export class DetailComponent {
  @Input() rowKey: any; // the row object
}`;

  templateSnippet = `<signal-grid
  [model]="rows"
  [columns]="columns"
  [rowExpanderConfig]="DefaultRowExpanderComponent"></signal-grid>`;
}
