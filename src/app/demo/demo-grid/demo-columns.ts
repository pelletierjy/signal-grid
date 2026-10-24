import { ColumnSchema } from '../../../../projects/signal-grid/src/lib/grid/models/column-schema';

const statusColors = { true: '#d6eadf', false: '#f1d4d4' };

/**
 * 100% JSON-first demo: plain schema literals — no builder, no callbacks.
 * Per-row dynamics use Formly-style `expressions` strings, so the whole array
 * survives `JSON.stringify` / `JSON.parse` untouched (try it in the console:
 * `JSON.stringify(buildDemoColumns())`).
 */
export function buildDemoColumns(): ColumnSchema[] {
  return [
    { field: 'isRegistered', header: 'Status badge', width: 100, type: 'status-badge', props: { colors: statusColors } },
    {
      field: 'age',
      header: 'Age (select)',
      width: 100,
      editable: true,
      type: 'select-cell',
      props: { options: [25, 50, 75, 100] }
    },
    {
      field: 'name',
      header: 'Name (select)',
      width: 180,
      editable: true,
      type: 'select-cell',
      expressions: { props: "({ options: [value, 'Alpha', 'Beta'] })" }
    },
    {
      field: 'isRegistered',
      header: 'Badge + css class',
      width: 100,
      type: 'status-badge',
      props: { colors: statusColors },
      cssClass: 'demo-highlight'
    },
    { field: 'id', header: 'No type', width: 80 },
    { field: 'name', header: 'Unknown type', width: 180, type: 'does-not-exist' },
    {
      field: 'isActive',
      header: 'Toggle',
      width: 100,
      type: 'toggle-cell',
      expressions: { editable: 'index % 3 !== 0' }
    },
    {
      field: 'name',
      header: 'Per-row type',
      width: 180,
      expressions: { type: "formGroup.get('isActive').value ? 'status-badge' : 'string'" }
    },
    { field: 'id', header: 'Eager type', width: 80, type: 'eager-cell' }
  ];
}