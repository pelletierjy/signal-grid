import { ColumnConfiguration } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnSchema } from '../../../../projects/signal-grid/src/lib/grid/models/column-schema';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';

const statusColors = { true: '#d6eadf', false: '#f1d4d4' };

/**
 * Demo columns mixing both configuration styles: builder-produced
 * `ColumnConfiguration`s and plain {@link ColumnSchema} object literals.
 */
export function buildDemoColumns(): (ColumnConfiguration | ColumnSchema)[] {
  const highlighted = new ColumnConfigurationBuilder()
    .withField('isRegistered')
    .withType('status-badge')
    .width(100)
    .withProps({ colors: statusColors })
    .build('Badge + css class');
  highlighted.cellCssClass = () => 'demo-highlight';

  return [
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
    highlighted,
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
}
