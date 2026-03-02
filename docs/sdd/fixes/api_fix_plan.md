# API 404 錯誤修復計畫

## 問題診斷
您遇到的錯誤 `POST http://localhost:3000/api/analyze-image 404 (Not Found)` 表示前端應用程式試圖呼叫一個不存在的後端 API。

**原因分析：**
1. **沒有後端伺服器**：您的專案目前是一個純前端專案 (Vite + React)，`package.json` 中沒有顯示任何後端伺服器 (如 Express, NestJS) 的啟動腳本。
2. **錯誤的 API URL**：在 `.env` 中，`VITE_RECIPE_API_URL` 可能被設定為 `http://localhost:3000`，但實際上並沒有伺服器在 Port 3000 運行。
3. **Mock Data 機制**：雖然程式碼中有 Mock Data 的 fallback 機制，但它是在 `fetch` 拋出錯誤後才會觸發。現在 `fetch` 回傳了 404 (這是一個有效的 HTTP 回應，只是代表找不到資源)，導致程式進入錯誤處理流程。

## 修復方案

由於您可能還沒有準備好真正的後端 AI 辨識服務，我們建議您先使用 **Mock (模擬) 模式** 來讓功能可以運作。

### 方案 A：修改程式碼以強制使用 Mock Data (推薦)
這是最快能讓您看到效果的方法。我們將修改 `src/api/recipe.ts`，讓它在沒有真實 API 的情況下直接回傳模擬數據。

#### 1. 修改 `src/api/recipe.ts`
我們將修改 `recognizeImage` 函式，加入一個開關或直接回傳假資料。

```typescript
// src/api/recipe.ts

// ... (前面的 type 定義保持不變)

export const recognizeImage = async (
  imageUrl: string,
): Promise<AnalyzeResponse> => {
  // 檢查是否有設定 API URL，如果沒有或設定為 'mock'，則直接回傳模擬資料
  const apiUrl = import.meta.env.VITE_RECIPE_API_URL;
  
  // 強制使用 Mock 模式的條件
  if (!apiUrl || apiUrl === 'mock' || apiUrl.includes('localhost')) {
    console.warn('Using Mock Data for recognizeImage');
    // 模擬延遲，讓體驗更真實
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        productName: '鮮奶',
        category: '乳製品飲料類',
        attributes: '鮮奶類',
        quantity: '1 / 罐',
        expiryDate: '約10天',
        notes: '常備品',
      }
    };
  }

  // 原有的真實 API 呼叫邏輯
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
```

### 方案 B：如果您有真實的後端 API
如果您確實有一個後端伺服器（例如 Python/Node.js 寫的 AI 服務）：

1. **確認伺服器已啟動**：確保您的後端程式正在執行，並且監聽在正確的 Port (例如 3000)。
2. **修正 .env**：
   在 `.env` 檔案中，將 `VITE_RECIPE_API_URL` 設定為正確的後端位址。
   ```env
   VITE_RECIPE_API_URL=http://localhost:3000
   ```
   *(注意：不要加 `/api/analyze-image`，因為程式碼中會自動串接)*

## 建議執行步驟
鑑於您目前的專案結構，我建議採用 **方案 A**。

1. 請確認您是否同意修改 `src/api/recipe.ts` 來實作 Mock 模式？
2. 如果同意，我可以為您自動套用這個變更。
