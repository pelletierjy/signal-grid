import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GridSampleData } from '../../../../projects/signal-grid/src/lib/grid/grid-sample-data';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { sampleRows } from '../demo-data';

/**
 * Demonstrates the editing lifecycle: inline edits, debounced modelChange,
      saveChanges and resetChanges outputs, and form validity.
 */
@Component({
  selector: 'app-editable-demo',
  standalone: false,
  template: `
    <h1>Editable cells</h1>
    <p class="lead">
      Make a column editable with <code>editable()</code> on the builder. The grid creates a form
      control for each visible row and tracks unsaved changes in a sparse map keyed by row identity.
    </p>

    <h2>Outputs</h2>
    <table>
      <tr>
        <th>Output</th>
        <th>When it fires</th>
      </tr>
      <tr>
        <td><code>modelChange</code></td>
        <td>Debounced (250 ms) while you type. Emits the full row array with edits applied.</td>
      </tr>
      <tr>
        <td><code>saveChanges</code></td>
        <td>When the user presses the built-in Save button. Commits edits internally.</td>
      </tr>
      <tr>
        <td><code>resetChanges</code></td>
        <td>When the user presses the built-in Reset button. Reverts to the last model.</td>
      </tr>
    </table>

    <h2>Column setup</h2>
    <app-code-block [code]="columnsSnippet" />

    <h2>Template</h2>
    <p>
      The grid shows Save / Reset buttons automatically while there are unsaved edits. Hook the
      outputs to persist data or revert it.
    </p>
    <app-code-block [code]="templateSnippet" />

    <h2>Live example</h2>
    <p>
      Edit a name, age, or the active checkbox. The JSON below shows the last
      <code>saveChanges</code> event.
    </p>
    <div class="demo">
      <signal-grid
        [model]="rows"
        [columns]="columns"
        (modelChange)="onModelChange($event)"
        (saveChanges)="onSave($event)"
        (resetChanges)="onReset()" />
    </div>

    <div class="save-panel">
      <div class="save-panel__head">
        <strong>Last saved model</strong>
      </div>
      @if (lastSave()) {
      <pre class="save-panel__body">{{ lastSave() }}</pre>
      } @else {
      <p class="save-panel__empty">Edit a cell and press Save to see the emitted rows.</p>
      }
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableDemoComponent {
  rows = sampleRows();
  lastSave = signal<string | null>(null);

  columns = [
    new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
    new ColumnConfigurationBuilder().withField('name').withType('string').editable().build('Name'),
    new ColumnConfigurationBuilder().withField('age').withType('number').editable().build('Age'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('boolean')
      .editable()
      .build('Active')
  ];

  columnsSnippet = `const columns = [
  new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
  new ColumnConfigurationBuilder().withField('name').withType('string').editable().build('Name'),
  new ColumnConfigurationBuilder().withField('age').withType('number').editable().build('Age'),
  new ColumnConfigurationBuilder()
    .withField('isActive')
    .withType('boolean')
    .editable()
    .build('Active')
];`;

  templateSnippet = `<signal-grid
  [model]="rows"
  [columns]="columns"
  (modelChange)="onModelChange($event)"
  (saveChanges)="onSave($event)"
  (resetChanges)="onReset()"></signal-grid>`;

  onModelChange(_model: unknown[]): void {
    // Merged model with edits applied; emitted (debounced) while editing.
  }

  onSave(savedModel: unknown[]): void {
    this.lastSave.set(JSON.stringify(savedModel, null, 2));
  }

  onReset(): void {
    this.lastSave.set(null);
  }
}
