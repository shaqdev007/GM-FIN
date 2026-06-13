export type RowType = 'header' | 'value' | 'formula' | 'blank';

export interface SpreadsheetRow {
  id: string;
  rowNumber: number;
  label: string;
  value?: number;
  rowType: RowType;
  cellRef?: string;
  category?: string;
  formulaPt?: string;
  formulaEn?: string;
}

export type Language = 'pt' | 'en';
export type CurrencySymbol = 'R$' | '$' | '€';
