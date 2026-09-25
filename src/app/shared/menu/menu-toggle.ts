import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuToggle {
  private static _isOpened = false;
  public static get isOpened(): boolean {
    return this._isOpened;
  }
  public static toggle() {
    this._isOpened = !this._isOpened;
  }
}
