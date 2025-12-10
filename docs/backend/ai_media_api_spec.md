# AI Service & Media Upload API Specification

**版本**: v1.0  
**涵蓋範圍**: AI 影像辨識、AI 食譜建議、媒體上傳（對應 API_REFERENCE_V2 #51-#52、#57）

---

## 1. 基本規範
- Base URL: `/api/v1`
- 需帶 Access Token（若開放匿名可另行註記）
- 成功/錯誤格式同 `auth_api_spec.md`

---

## 2. AI Service

### 2.1 影像辨識（OCR / 食材結構化）
- **POST** `/api/v1/ai/analyze-image`
- Body: `{ imageUrl: string }`
- 200 → 
```json
{
  "success": true,
  "data": {
    "productName": "蘋果",
    "category": "水果",
    "attributes": "常溫",
    "purchaseQuantity": 1,
    "unit": "顆",
    "purchaseDate": "2025-12-08",
    "expiryDate": "2025-12-15",
    "lowStockAlert": true,
    "lowStockThreshold": 2,
    "notes": "",
    "imageUrl": "https://..."
  },
  "timestamp": "2025-12-08T10:00:00Z"
}
```

### 2.2 AI 食譜建議（尚未實作）
- **POST** `/api/v1/ai/recipe`
- Body: `{ ingredients: string[] | FoodItemInput[] }`
- 501/200 → 規劃中（前端目前為 placeholder）

---

## 3. Media Upload

### 3.1 上傳圖片
- **POST** `/api/v1/media/upload`
- Body: `FormData` with field `file`
- 200 → `{ url: "https://..." }`

#### 注意
- 後端需驗證檔案型別/大小並進行安全掃描。
- 建議返回經 CDN 優化後的公開 URL。 
