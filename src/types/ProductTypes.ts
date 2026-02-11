export enum ProductType {
    IMPASTO = 'impasto',
    SALUME = 'salume',
    FORMAGGIO = 'formaggio',
}

export const PRODUCT_TYPES = [
    { label: 'Impasto', value: ProductType.IMPASTO },
    { label: 'Salume', value: ProductType.SALUME },
    { label: 'Formaggio', value: ProductType.FORMAGGIO },
];

export const getProductTypeLabel = (value: string): string => {
  const type = PRODUCT_TYPES.find(t => t.value === value);
  return type?.label || value;
};
