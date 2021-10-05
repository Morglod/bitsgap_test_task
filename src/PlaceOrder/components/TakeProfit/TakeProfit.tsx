/* eslint @typescript-eslint/no-use-before-define: 0 */

import React from "react";
import block from "bem-cn-lite";
import { AddCircle, Cancel } from "@material-ui/icons";

import { Switch, TextButton, NumberInput } from "components";

import { QUOTE_CURRENCY } from "../../constants";
import { OrderSide } from "../../model";
import "./TakeProfit.scss";

type Props = {
  orderSide: OrderSide;
  // ...
};

const b = block("take-profit");

const TakeProfit = ({ orderSide }: Props) => {
  return (
    <div className={b()}>
      <div className={b("switch")}>
        <span>Take profit</span>
        <Switch checked />
      </div>
      <div className={b("content")}>
        {renderTitles()}
        {renderInputs()}
        <TextButton className={b("add-button")}>
          <AddCircle className={b("add-icon")} />
          <span>Add profit target 2/5</span>
        </TextButton>
        <div className={b("projected-profit")}>
          <span className={b("projected-profit-title")}>Projected profit</span>
          <span className={b("projected-profit-value")}>
            <span>0</span>
            <span className={b("projected-profit-currency")}>
              {QUOTE_CURRENCY}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
  function renderInputs() {
    return (
      <div className={b("inputs")}>
        <NumberInput
          value={0}
          decimalScale={2}
          InputProps={{ endAdornment: "%" }}
          variant="underlined"
        />
        <NumberInput
          value={0}
          decimalScale={2}
          InputProps={{ endAdornment: QUOTE_CURRENCY }}
          variant="underlined"
        />
        <NumberInput
          value={0}
          decimalScale={2}
          InputProps={{ endAdornment: "%" }}
          variant="underlined"
        />
        <div className={b("cancel-icon")}>
          <Cancel />
        </div>
      </div>
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
};

export { TakeProfit };
