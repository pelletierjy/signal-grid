import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeadersBuilderFactory } from './http-headers-builder.service';
import { HttpOptionsBuilderFactory } from './http-options-builder.service';
import { HttpUrlBuilderFactory } from './http-url-builder.service';
import { ObjectValidatorService } from 'projects/signal-grid/src/lib/shared/object-validator.service';

@Injectable({
  providedIn: 'root'
})
export class HttpClientQ {
  // Should be able to pass options inside Observable<HttpResponse> methods
  // without defining it as an object, possible compiler issue
  constructor(
    private _httpClient: HttpClient,
    private _ovs: ObjectValidatorService,
    private _httpHeadersBuilderFactory: HttpHeadersBuilderFactory,
    private _httpOptionsBuilderFactory: HttpOptionsBuilderFactory,
    private _httpUrlBuilderFactory: HttpUrlBuilderFactory
  ) {}

  getResponse(url: string, parameters: any = null): Observable<HttpResponse<any>> {
    if (this._ovs.isDefined(parameters)) {
      return this._httpClient.get<any>(this.getDefaultUrl(url), {
        headers: this.getDefaultHeaders,
        observe: 'response',
        params: parameters
      });
    }

    return this._httpClient.get<any>(this.getDefaultUrl(url), {
      headers: this.getDefaultHeaders,
      observe: 'response'
    });
  }

  get(url: string, parameters?: any): Observable<any> {
    return this._httpClient.get<any>(
      this.getDefaultUrl(url),
      this._httpOptionsBuilderFactory.builder
        .withParameters(parameters)
        .withHeaders(this.getDefaultHeaders)
        .build()
    );
  }

  private get getDefaultHeaders(): HttpHeaders {
    return this._httpHeadersBuilderFactory.builder.withContentType().build();
  }

  private getDefaultUrl(url: string): string {
    return this._httpUrlBuilderFactory.getBuilder(url).build();
  }
}
