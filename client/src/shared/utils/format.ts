export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const toInputDate = (value: string | null) => value ?? "";

export const fromInputDate = (value: string) => (value ? value : null);
