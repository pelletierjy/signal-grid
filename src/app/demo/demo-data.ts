import { GridSampleData } from '../../../projects/signal-grid/src/lib/grid/grid-sample-data';
import { ColumnConfiguration } from '../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnConfigurationBuilder } from '../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';

const names = ['Ada', 'Grace', 'Linus', 'Margaret', 'Dennis'];

/** Small data set for the live examples (the full demo page has the 1 000 row one). */
export function sampleRows(): GridSampleData[] {
  return names.map(
    (name, index) =>
      new GridSampleData(index + 1, name, index % 2 === 0, 25 * ((index % 4) + 1), index % 3 !== 0)
  );
}

export function basicColumns(): ColumnConfiguration[] {
  return [
    new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
    new ColumnConfigurationBuilder().withField('name').withType('string').build('Name'),
    new ColumnConfigurationBuilder().withField('isActive').withType('boolean').build('Active')
  ];
}
