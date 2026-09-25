import { ColumnConfiguration } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';

const statusColors = { true: '#d6eadf', false: '#f1d4d4' };

export function buildDemoColumns(): ColumnConfiguration[] {
  const highlighted = new ColumnConfigurationBuilder()
    .withField('isRegistered')
    .withType('status-badge')
    .withProps({ colors: statusColors })
    .build('Badge + css class');
  highlighted.cellCssClass = () => 'demo-highlight';

  return [
    new ColumnConfigurationBuilder()
      .withField('isRegistered')
      .withType('status-badge')
      .withProps({ colors: statusColors })
      .build('Status badge'),
    new ColumnConfigurationBuilder()
      .withField('age')
      .editable()
      .withType('select-cell')
      .withProps({ options: [25, 50, 75, 100] })
      .build('Age (select)'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .editable()
      .withType('select-cell')
      .withProps(cb => ({ options: [cb.value, 'Alpha', 'Beta'] }))
      .build('Name (select)'),
    highlighted,
    new ColumnConfigurationBuilder().withField('id').build('No type'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .withType('does-not-exist')
      .build('Unknown type'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .withType('toggle-cell')
      .editable(cb => cb.index % 3 !== 0)
      .build('Toggle'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .withType(cb =>
        cb.formGroup.get([String(cb.index), 'isActive'])?.value ? 'status-badge' : 'string'
      )
      .build('Per-row type'),
    new ColumnConfigurationBuilder().withField('id').withType('eager-cell').build('Eager type')
  ];
}
