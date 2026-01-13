const ILS_FORMATTER = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 2
});

export const formatILS = (agorot: number): string => {
  const value = agorot / 100;
  return ILS_FORMATTER.format(value);
};

export const parseILS = (input: string): number => {
  const normalized = input.replace(/[₪,\s]/g, "").replace(/[^\d.]/g, "");
  if (!normalized) return 0;
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
};
