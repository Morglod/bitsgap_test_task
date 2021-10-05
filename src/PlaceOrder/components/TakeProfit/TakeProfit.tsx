/* eslint @typescript-eslint/no-use-before-define: 0 */

import React from "react";
import block from "bem-cn-lite";
import { AddCircle, Cancel } from "@material-ui/icons";

import { Switch, TextButton, NumberInput } from "components";

import { QUOTE_CURRENCY } from "../../constants";
import { OrderSide, TakeProfitTarget } from "../../model";
import "./TakeProfit.scss";
import { useStore } from "PlaceOrder/context";
import { observer } from "mobx-react";

type Props = {
  orderSide: OrderSide;
  // ...
};

const b = block("take-profit");

const TakeProfit = observer(({ orderSide }: Props) => {
  const {
    takeProfitFlag,
    setTakeProfitFlag,
    maxProfitTargets,
    takeProfitTargets: takeProfitRows,
    pushTakeProfitTarget,
    removeTakeProfitTarget,
    projectedProfit,
    profitTarget_setAmount,
    profitTarget_setPrice,
    profitTarget_setProfit,
  } = useStore();

  return (
    <div className={b()}>
      <div className={b("switch")}>
        <span>Take profit</span>
        <Switch checked={takeProfitFlag} onChange={val => setTakeProfitFlag(val)} />
      </div>
      <div className={b("content", { hidden: !takeProfitFlag })}>
        {renderTitles()}
        {renderInputs()}
        {renderAddButton()}
        <div className={b("projected-profit")}>
          <span className={b("projected-profit-title")}>Projected profit</span>
          <span className={b("projected-profit-value")}>
            <span>{projectedProfit.toFixed(2)}</span>
            <span className={b("projected-profit-currency")}>
              {QUOTE_CURRENCY}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  function renderAddButton() {
    return (
      <TextButton
        className={b("add-button", { hidden: takeProfitRows.length === maxProfitTargets })}
        onClick={() => pushTakeProfitTarget()}
      >
        <AddCircle className={b("add-icon")} />
        <span>Add profit target {takeProfitRows.length}/{maxProfitTargets}</span>
      </TextButton>
    );
  }

  function renderInputs() {
    return (
      <>
        {takeProfitRows.map((target, i) => (
          <div key={i} className={b("inputs")}>
            <NumberInput
              value={target.profitPercent * 100}
              onBlur={newVal => profitTarget_setProfit(target, (newVal || 0) / 100)}
              error={target.profitValidationError}
              decimalScale={2}
              InputProps={{ endAdornment: "%" }}
              variant="underlined"
            />
            <NumberInput
              value={target.targetPrice}
              onBlur={newVal => profitTarget_setPrice(target, newVal || 0)}
              error={target.targetPriceValidationError}
              decimalScale={2}
              InputProps={{ endAdornment: QUOTE_CURRENCY }}
              variant="underlined"
            />
            <NumberInput
              value={target.amountPercent * 100}
              onBlur={newVal => profitTarget_setAmount(target, (newVal || 0) / 100)}
              error={target.amountValidationError}
              decimalScale={2}
              InputProps={{ endAdornment: "%" }}
              variant="underlined"
            />
            <div className={b("cancel-icon")}>
              <Cancel
                onClick={() => removeTakeProfitTarget(target)}
              />
            </div>
          </div>
        ))}
      </>
    );
  }

  function renderTitles() {
    return (
      <div className={b("titles")}>
        <span>Profit</span>
        <span>Target price</span>
        <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
      </div>
    );
  }
});

export { TakeProfit };
