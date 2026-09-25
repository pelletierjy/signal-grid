import { Utility } from '../shared/utility';
import { ReplaySubject } from 'rxjs';
import { SubjectItem } from './subject-item';

export class SubjectManager {
  subjectsDictionary: { [id: string]: SubjectItem } = {};

  next(key: string, input: any): void {
    if (!Utility.isDefined(this.subjectsDictionary[key])) {
      this.subjectsDictionary[key] = new SubjectItem(new ReplaySubject<any>());
    }
    this.subjectsDictionary[key].next(input);
  }

  clear() {
    for (let key in this.subjectsDictionary) {
      this.subjectsDictionary[key].unsubscribe();
    }
    this.subjectsDictionary = {};
  }
}
