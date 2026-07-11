export const supportedCurrencies = ["USD", "SGD", "MYR"] as const;

export function isSupportedCurrency(value: string) {
  return supportedCurrencies.includes(
    value as (typeof supportedCurrencies)[number],
  );
}

export function currencyPrefix(currency: string) {
  const prefixes: Record<string, string> = {
    USD: "$",
    SGD: "S$",
    MYR: "RM",
  };

  return prefixes[currency] ?? currency;
}
