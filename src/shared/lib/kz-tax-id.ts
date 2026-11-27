// Контрольный разряд БИН/ИИН (тот же алгоритм, что в public.is_valid_kz_tax_id).
export const isValidKzTaxId = (value: string): boolean => {
  if (!/^\d{12}$/.test(value)) return false;
  const digits = [...value].map(Number);
  const sum = (weight: (index: number) => number) =>
    digits.slice(0, 11).reduce((acc, digit, index) => acc + digit * weight(index), 0) % 11;

  let check = sum((index) => index + 1);
  if (check === 10) check = sum((index) => ((index + 2) % 11) + 1);
  return check !== 10 && check === digits[11];
};
