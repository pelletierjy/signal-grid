import { Injectable } from '@angular/core';

export class HttpUrlBuilder {
  constructor(private url: string) {}

  build() {
    return this.url;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HttpUrlBuilderFactory {
  getBuilder(url: string): HttpUrlBuilder {
    return new HttpUrlBuilder(url);
  }
}
