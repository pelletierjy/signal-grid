import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

export class HttpHeadersBuilder {
  private _headers: HttpHeaders;

  constructor() {
    this._headers = new HttpHeaders();
  }

  withContentType(): HttpHeadersBuilder {
    this._headers = this._headers.append('Content-Type', 'application/json');
    return this;
  }

  build(): HttpHeaders {
    return this._headers;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HttpHeadersBuilderFactory {
  get builder(): HttpHeadersBuilder {
    return new HttpHeadersBuilder();
  }
}
