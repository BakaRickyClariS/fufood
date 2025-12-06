export const calculateShelfLife = (
  purchaseDate: string,
  expiryDate: string,
): number => {
  if (!purchaseDate || !expiryDate) return 0;
  const purchase = new Date(purchaseDate);
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - purchase.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
