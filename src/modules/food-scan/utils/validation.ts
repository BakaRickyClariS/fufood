export const validateExpiryDate = (purchaseDate: string, expiryDate: string): boolean => {
  return new Date(expiryDate) > new Date(purchaseDate);
};

export const validateQuantity = (value: number, min = 1, max = 999): boolean => {
  return value >= min && value <= max;
};
