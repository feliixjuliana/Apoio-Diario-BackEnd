export const DATA_CIVIL_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const DATA_CIVIL_MESSAGE =
  'dataInicio deve estar no formato YYYY-MM-DD.';

export function parseDataCivil(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
