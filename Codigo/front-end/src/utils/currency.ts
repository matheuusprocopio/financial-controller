const toCurrencyString = (amount: number) => {
  const [integerPart, decimalPart] = amount.toFixed(2).split(".");
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${withSeparators},${decimalPart}`;
};

export const formatCurrencyValue = (value?: string | number) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "number") {
    const safeValue = Number.isFinite(value) ? value : 0;
    return toCurrencyString(safeValue);
  }

  const digits = `${value}`.replace(/\D/g, "");
  if (!digits) return "";

  const numberValue = Number(digits) / 100;
  return toCurrencyString(numberValue);
};

export const parseCurrencyToNumber = (value?: string) => {
  const digits = (value ?? "").replace(/\D/g, "");
  return Number(digits || "0") / 100;
};
