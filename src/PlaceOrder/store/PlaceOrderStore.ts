import { observable, computed, action } from "mobx";
import { OrderSide, TakeProfitTarget } from "../model";

export class PlaceOrderStore {
  @observable price: number = 0;
  @observable amount: number = 0;
  @observable maxProfitTargets = 5;
  @observable takeProfitTargets: TakeProfitTarget[] = [];

  @observable isFormValid = true;

  @observable private _takeProfitFlag = false;
  @computed get takeProfitFlag() {
    return this._takeProfitFlag;
  }

  @observable private _activeOrderSide: OrderSide = "buy";
  @computed get activeOrderSide() {
    return this._activeOrderSide;
  }

  @computed get total(): number {
    return this.price * this.amount;
  }

  @computed get projectedProfit(): number {
    let value = 0;

    for (const t of this.takeProfitTargets) {
      const amount = this.amount * t.amountPercent;
      value += this.activeOrderSide === 'buy' ? amount * (t.targetPrice - this.price) : amount * (this.price - t.targetPrice);
    }

    return value;
  }

  @action.bound
  public setTakeProfitFlag(flag: boolean) {
    this._takeProfitFlag = flag;

    if (this.takeProfitTargets.length === 0) {
      this.pushTakeProfitTarget();
    }
  }

  @action.bound
  public pushTakeProfitTarget() {
    const prevProfitPercent = this.takeProfitTargets[this.takeProfitTargets.length - 1]?.profitPercent || 0;
    const profitPercent = prevProfitPercent + 0.02;

    const newTarget = observable({
      profitPercent,
      targetPrice: this.price + (this.activeOrderSide === 'buy' ? this.price : -this.price) * profitPercent,
      amountPercent: this.takeProfitTargets.length === 0 ? 1 : 0.2,
      amountValidationError: undefined,
      profitValidationError: undefined,
      targetPriceValidationError: undefined,
    });
    this.takeProfitTargets.push(newTarget);

    // skip 'amount overflow' verification
    if (this.takeProfitTargets.length !== 1) {
      let amountPercentSum = 0;
      let maxAmountIn = this.takeProfitTargets[0];
      for (const t of this.takeProfitTargets) {
        amountPercentSum += t.amountPercent;
        if (maxAmountIn.amountPercent <= t.amountPercent) maxAmountIn = t;
      }
      if (amountPercentSum > 1) {
        maxAmountIn.amountPercent -= amountPercentSum - 1;
      }
    }

    return newTarget;
  }

  @action.bound
  public profitTarget_setProfit(target: TakeProfitTarget, newProfitPercent: number) {
    target.profitPercent = newProfitPercent;
    target.targetPrice = this.price * (1 + newProfitPercent);

    target.profitValidationError = undefined;
    target.targetPriceValidationError = undefined;
  }

  @action.bound
  public profitTarget_setPrice(target: TakeProfitTarget, newPrice: number) {
    target.profitPercent = ((newPrice / this.price) * 100 - 100) / 100; // precision stuff
    target.targetPrice = newPrice;

    target.profitValidationError = undefined;
    target.targetPriceValidationError = undefined;
  }

  @action.bound
  public profitTarget_setAmount(target: TakeProfitTarget, newAmountPercent: number) {
    target.amountPercent = newAmountPercent;
    target.amountValidationError = undefined;
  }

  @action.bound
  public removeTakeProfitTarget(target: TakeProfitTarget) {
    this.takeProfitTargets = this.takeProfitTargets.filter(x => x !== target);
    if (this.takeProfitTargets.length === 0) this.setTakeProfitFlag(false);
  }

  @action.bound
  public setOrderSide(side: OrderSide) {
    const shouldUpdateTakeProfit = this._activeOrderSide !== side;
    this._activeOrderSide = side;

    if (shouldUpdateTakeProfit) {
      this._takeProfitFlag = false;
      this.takeProfitTargets = [];
    }
  }

  @action.bound
  public setPrice(price: number) {
    this.price = price;
  }

  @action.bound
  public setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  public setTotal(total: number) {
    this.amount = this.price > 0 ? total / this.price : 0;
  }

  @action.bound
  public validateForm() {
    let isValid = true;
    let totalProfit = 0;
    let totalAmount = 0;

    for (let i = 0; i < this.takeProfitTargets.length; ++i) {
      const t = this.takeProfitTargets[i];

      t.amountValidationError = undefined;
      t.profitValidationError = undefined;
      t.targetPriceValidationError = undefined;

      totalProfit += t.profitPercent;
      totalAmount += t.amountPercent;

      const prevProfitPercent = this.takeProfitTargets[i - 1]?.profitPercent || 0;

      if (t.profitPercent < 0.01) {
        t.profitValidationError = 'Minimum value is 0.01';
        isValid = false;
      }
      else if (t.profitPercent < prevProfitPercent) {
        t.profitValidationError = `Each target's profit should be greater than the previous one`;
        isValid = false;
      }
      
      if (t.targetPrice <= 0) {
        t.targetPriceValidationError = 'Price must be greater than 0';
        isValid = false;
      }
    }

    if (totalProfit > 5) {
      this.takeProfitTargets.forEach(x => x.profitValidationError = 'Maximum profit sum is 500%');
      isValid = false;
    }
    else if (totalAmount > 1) {
      const text = `${totalAmount * 100}% out of 100% selected. Please decrease by ${totalAmount * 100 - 100}%`;
      this.takeProfitTargets.forEach(x => x.amountValidationError = text);
      isValid = false;
    }

    this.isFormValid = isValid;
  }
}
