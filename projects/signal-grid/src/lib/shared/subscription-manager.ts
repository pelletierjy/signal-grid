import { Subscription } from 'rxjs';
import { ObjectValidatorService } from './object-validator.service';

export class SubscriptionManager {
  private _subscriptions: Subscription[] = [];
  private _subscriptionsDictionary: { [id: string]: Subscription } = {};
  protected _ovs = new ObjectValidatorService();

  private _registerKey(key: string, subscription: Subscription): void {
    if (!subscription) {
      return;
    }

    if (this._ovs.isDefined(this._subscriptionsDictionary[key])) {
      this.clearKey(key);
    }

    this._subscriptionsDictionary[key] = subscription;
  }

  register(subscription: Subscription, key: string = ''): void {
    if (!this._ovs.isDefined(subscription)) {
      return;
    }
    if (this._ovs.isNullOrEmpty(key)) {
      this._subscriptions.push(subscription);
      return;
    }
    this._registerKey(key, subscription);
  }

  registerMultiple(subscription: Subscription[]): void {
    if (subscription) {
      this._subscriptions.push(...subscription);
    }
  }

  clear(): void {
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
    this._subscriptions = [];
    Object.keys(this._subscriptionsDictionary)
      .map(key => this._subscriptionsDictionary[key])
      .filter(subscription => this._ovs.isDefined(subscription))
      .forEach(subscription => subscription.unsubscribe());
    this._subscriptionsDictionary = {};
  }

  clearKey(key: string): void {
    if (this._ovs.isDefined(this._subscriptionsDictionary[key])) {
      this._subscriptionsDictionary[key].unsubscribe();
      this._subscriptionsDictionary[key] = null;
    }
  }
}
