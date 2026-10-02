import { ColumnConfiguration } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';

const statusColors = { true: '#d6eadf', false: '#f1d4d4' };

export function buildDemoColumns(): ColumnConfiguration[] {
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
    new ColumnConfigurationBuilder()
      .withField('id')
      .width(80)
      .build('No type'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .width(180)
      .withType('does-not-exist')
      .build('Unknown type'),
    new ColumnConfigurationBuilder()
      .withField('isActive')
      .width(100)
      .withType('toggle-cell')
      .editable(cb => cb.index % 3 !== 0)
      .build('Toggle'),
    new ColumnConfigurationBuilder()
      .withField('name')
      .width(180)
      .withType(cb =>
        cb.formGroup.get([String(cb.index), 'isActive'])?.value ? 'status-badge' : 'string'
      )
      .build('Per-row type'),
    new ColumnConfigurationBuilder()
      .withField('id')
      .width(80)
      .withType('eager-cell')
      .build('Eager type')
  ];
}