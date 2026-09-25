import { Observable, ReplaySubject } from 'rxjs';

export class SubjectItem {
  observable$: Observable<any>;

  constructor(private _subject: ReplaySubject<any>) {
    this.observable$ = _subject.asObservable();
  }

  next(input: any) {
    this._subject.next(input);
  }

  unsubscribe() {
    this._subject.unsubscribe();
  }
}
