import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GridSampleData } from '../../../../projects/signal-grid/src/lib/grid/grid-sample-data';
import { SignalGridFilterFormConfig } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { sampleRows } from '../demo-data';

/**
 * Shows how to add a Formly filter form above the grid and react to the
 * filterSubmit event to reduce the displayed rows.
 */
@Component({
  selector: 'app-filtering-demo',
  standalone: false,
  template: `
    <h1>Filtering</h1>
    <p class="lead">
      Pass a <code>SignalGridFilterFormConfig</code> to <code>[filterFormConfig]</code> and the grid
      renders a filter bar above the viewport. When the user applies or clears filters, the
      <code>filterSubmit</code> output emits the current filter values.
    </p>

    <h2>Filter configuration</h2>
    <p>
      The config is standard Formly: an array of <code>FormlyFieldConfig</code>, optional button
      labels, and an optional model. The grid wraps the fields in its own form and handles Apply /
      Reset buttons.
    </p>
    <app-code-block [code]="filterSnippet" />

    <h2>Reacting to the output</h2>
    <p>
      The component receives the filter object, runs its own logic, and assigns a reduced array back
      to <code>[model]</code>. Because rows are tracked by <strong>object identity</strong>, any
      unsaved edits stay attached to the original row objects.
    </p>
    <app-code-block [code]="handlerSnippet" />

    <h2>Live example</h2>
    <p>Type a name or toggle the checkboxes, then press Apply Filters.</p>
    <div class="demo">
      <signal-grid
        [model]="displayedRows()"
        [columns]="columns"
        [filterFormConfig]="filterFormConfig"
        (filterSubmit)="onFilterSubmit($event)" />
    </div>
  `,
  styleUrls: ['../demo-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilteringDemoComponent {
  private readonly allRows = sampleRows();
  displayedRows = signal<GridSampleData[]>(this.allRows);

  columns = [
    new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
    new ColumnConfigurationBuilder().withField('name').withType('string').editable().build('Name'),
    new ColumnConfigurationBuilder()
      .withField('isRegistered')
      .withType('boolean')
      .build('Registered'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('boolean')
      .editable()
      .build('Active')
  ];

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

  filterSnippet = `const filterFormConfig: SignalGridFilterFormConfig = {
  fields: [
    {
      key: 'name',
      type: 'input',
      templateOptions: { label: 'Name', placeholder: 'Search by name...' }
    },
    {
      key: 'isRegistered',
      type: 'checkbox',
      templateOptions: { label: 'Registered only' }
    }
  ],
  submitBtnText: 'Apply Filters',
  resetBtnText: 'Clear Filters'
};`;

  handlerSnippet = `onFilterSubmit(filter: Record<string, unknown>): void {
  const name = (filter['name'] as string)?.toLowerCase() ?? '';
  const registered = filter['isRegistered'];

  this.displayedRows = this.allRows.filter(row => {
    if (name && !row.name.toLowerCase().includes(name)) return false;
    if (registered && !row.isRegistered) return false;
    return true;
  });
}`;

  onFilterSubmit(filter: Record<string, unknown>): void {
    const name = ((filter['name'] as string) ?? '').toLowerCase();
    const reg = filter['isRegistered'];
    const act = filter['isActive'];

    this.displayedRows.set(
      this.allRows.filter(row => {
        if (name && !row.name.toLowerCase().includes(name)) return false;
        if (reg === true && !row.isRegistered) return false;
        if (act === true && !row.isActive) return false;
        return true;
      })
    );
  }
}
