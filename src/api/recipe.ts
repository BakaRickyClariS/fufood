export type AnalyzeResponse = {
  success: boolean;
  data: {
    productName: string;
    category: string;
    attributes: string;
    quantity: string;
    expiryDate: string;
    notes: string;
  };
  timestamp: string;
};

export const recognizeImage = async (
  imageUrl: string,
): Promise<AnalyzeResponse> => {
  const apiUrl = import.meta.env.VITE_RECIPE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_RECIPE_API_URL is not defined');
  }

  const response = await fetch(`${apiUrl}/api/analyze-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};
