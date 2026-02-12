export interface GS1Data {
  gtin?: string;
  expiryDate?: string;
  lot?: string;
  serial?: string;
  weightKg?: number;        // peso in kg
  weightDecimals?: number;  // numero di decimali
}

export interface AIConfig {
  field: string;
  length?: number;
  variable?: boolean;
}