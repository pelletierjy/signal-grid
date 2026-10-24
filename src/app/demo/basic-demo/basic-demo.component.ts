import { ChangeDetectionStrategy, Component } from '@angular/core';
import { basicColumns, sampleRows } from '../demo-data';

/**
 * The simplest possible grid: a read-only table with three columns.
 * No editing, no custom types, no expander — just model + columns.
 */
@Component({
  selector: 'app-basic-demo',
  standalone: false,
  template: `
    <h1>Basic grid</h1>
    <p class="lead">
      The smallest setup that renders a grid: pass an array of rows to
      <code>[model]</code> and an array of column configurations to <code>[columns]</code>.
    </p>

    <h2>Column configuration</h2>
    <p>
      Each column needs at least a <code>field</code> (the row property to show) and a
      <code>type</code> (how to render it). The built-in <code>number</code>,
      <code>string</code> and <code>boolean</code> types are always available.
    </p>
    <app-code-block [code]="columnsSnippet" />

    <h2>Template</h2>
    <app-code-block [code]="templateSnippet" />

    <h2>Live example</h2>
    <div class="demo">
      <signal-grid [model]="rows" [columns]="columns" />
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicDemoComponent {
  rows = sampleRows();
  columns = basicColumns();

  columnsSnippet = `import { ColumnConfigurationBuilder } from '@jypsolution/signal-grid';

const columns = [
  new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
  new ColumnConfigurationBuilder().withField('name').withType('string').build('Name'),
  new ColumnConfigurationBuilder().withField('isActive').withType('boolean').build('Active')
];`;

  templateSnippet = `<signal-grid
  [model]="rows"
  [columns]="columns"></signal-grid>`;
}
