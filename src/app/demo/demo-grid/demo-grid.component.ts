import { Component } from '@angular/core';
import { DemoComponent } from '../demo/demo.component';
import { Router } from '@angular/router';
import { TestDataService } from '../../../../projects/signal-grid/src/lib/grid/test-data.service';
import { GridSampleData } from '../../../../projects/signal-grid/src/lib/grid/grid-sample-data';
import { Model } from '../../../../projects/signal-grid/src/lib/grid/models/model';
import { ColumnConfiguration } from '../../../../projects/signal-grid/src/lib/grid/models/models';
import { buildDemoColumns } from './demo-columns';

@Component({
  selector: 'app-demo-grid',
  standalone: false,
  templateUrl: './demo-grid.component.html',
  styleUrls: ['./demo-grid.component.scss']
})
export class DemoGridComponent extends DemoComponent {
  columns: ColumnConfiguration[];
  model: GridSampleData[];

  constructor(_router: Router, public gridTest: TestDataService) {
    super(_router);
    this.columns = [...gridTest.columns, ...buildDemoColumns()];
    this.model = gridTest.data;
  }

  onModelChange(model: Model[]): void {
    console.log('modelChange', model);
  }

  reload(): void {
    this.model = Array.from(
      { length: 10 },
      (_, index) =>
        new GridSampleData(
          index,
          `Reloaded-${index}`,
          index % 3 === 0,
          (Math.floor(Math.random() * 4) + 1) * 25,
          index % 2 === 0
        )
    );
  }
}
