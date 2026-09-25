import { Component } from '@angular/core';
import { ColumnConfiguration } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { ColumnConfigurationBuilder } from '../../../../projects/signal-grid/src/lib/grid/services/column-configuration-builder';
import { TestDataService } from '../../../../projects/signal-grid/src/lib/grid/test-data.service';

@Component({
  selector: 'app-lazy-grid',
  standalone: false,
  templateUrl: './lazy-grid.component.html'
})
export class LazyGridComponent {
  columns: ColumnConfiguration[];

  constructor(public gridTest: TestDataService) {
    this.columns = [
      ...gridTest.columns,
      new ColumnConfigurationBuilder().withField('name').withType('lazy-cell').build('Lazy type'),
      new ColumnConfigurationBuilder()
        .withField('isRegistered')
        .withType('status-badge')
        .withProps({ colors: { true: '#d6eadf', false: '#f1d4d4' } })
        .build('Root type')
    ];
  }
}
