import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ObjectValidatorService } from 'projects/signal-grid/src/lib/shared/object-validator.service';

export class HttpOptionBuilder {
  private _httpOptions = {};
  constructor(private _ovs: ObjectValidatorService) {}

  withParameters(parameters?: any): HttpOptionBuilder {
    if (this._ovs.isDefined(parameters)) {
      let params = new HttpParams();
      Object.keys(parameters).map(k => (params = params.append(k, parameters[k])));
      (this._httpOptions as any).params = params;
    }
    return this;
  }

  withHeaders(headers: any): HttpOptionBuilder {
    if (this._ovs.isDefined(headers)) {
      (this._httpOptions as any).headers = headers;
    }
    return this;
  }

  withObserve(observe: string): HttpOptionBuilder {
    if (this._ovs.isDefined(observe)) {
      (this._httpOptions as any).observe = observe;
    }
    return this;
  }

  build(): any {
    return this._httpOptions;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HttpOptionsBuilderFactory {
  constructor(private _ovs: ObjectValidatorService) {}
  get builder(): HttpOptionBuilder {
    return new HttpOptionBuilder(this._ovs);
  }
}
