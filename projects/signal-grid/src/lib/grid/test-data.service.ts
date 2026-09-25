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
    const data = [];
    for (let index = 0; index < 10000; index++) {
      data.push(
        new GridSampleData(
          index,
          `Name-${index}`,
          (index % 2 === 0) as boolean,
          (Math.floor(Math.random() * 4) + 1) * 25,
          Math.random() * 10 > 5
        )
      );
    }
    this.data = data;
    this.columns = [
      new ColumnConfigurationBuilder().withField('id').withType('number').build('ID'),
      new ColumnConfigurationBuilder()
        .withField('name')
        .editable()
        .withType('string')
        .build('Name'),
      new ColumnConfigurationBuilder()
        .withField('isRegistered')
        .withType('boolean')
        .build('Registered'),
      new ColumnConfigurationBuilder().withField('age').editable().withType('number').build('Age'),
      new ColumnConfigurationBuilder()
        .withField('isActive')
        .editable()
        .withType('boolean')
        .build('Active')
    ];
  }
}
