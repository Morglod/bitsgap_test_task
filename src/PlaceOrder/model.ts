export type OrderSide = "buy" | "sell";

export type TakeProfitTarget = {
    /** 0 .. 1 */
    profitPercent: number,
    targetPrice: number,
    /** 0 .. 1 */
    amountPercent: number,

    profitValidationError: string|undefined,
    targetPriceValidationError: string|undefined,
    amountValidationError: string|undefined,
};
