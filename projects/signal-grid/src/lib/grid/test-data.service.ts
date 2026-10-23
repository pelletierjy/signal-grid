import { Injectable } from '@angular/core';
import { GridSampleData } from './grid-sample-data';
import { ColumnConfiguration } from './models/models';
import { ColumnConfigurationBuilder } from './services/column-configuration-builder';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
  data: GridSampleData[];
  columns: ColumnConfiguration[];

  constructor() {
    this.data = [...Array(1000)].map(
      (_, index) =>
        new GridSampleData(
          index,
          `Name-${index}`,
          index % 2 === 0,
          (Math.floor(Math.random() * 4) + 1) * 25,
          Math.random() * 10 > 5
        )
    );
    this.columns = [
      new ColumnConfigurationBuilder().withField('id').width(80).withType('number').build('ID'),
      new ColumnConfigurationBuilder()
        .withField('name')
        .width(80)
        .editable()
        .withType('string')
        .build('Name'),
      new ColumnConfigurationBuilder()
        .withField('isRegistered')
        .width(60)
        .withType('boolean')
        .build('Registered'),
      new ColumnConfigurationBuilder()
        .withField('age')
        .width(80)
        .editable()
        .withType('number')
        .build('Age'),
      new ColumnConfigurationBuilder()
        .withField('isActive')
        .width(50)
        .editable()
        .withType('boolean')
        .build('Active')
    ];
  }
}
