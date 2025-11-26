import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function uploadToCloudinary() {
  const imagePath = 'C:/Users/User/Downloads/IMG_5009.jpg';
  
  // 讀取圖片
  const imageBuffer = fs.readFileSync(imagePath);
  
  // 準備 FormData
  const formData = new FormData();
  formData.append('file', imageBuffer, 'IMG_5009.jpg');
  formData.append('upload_preset', 'fufood');
  
  const cloudName = 'dpf4mtq1q';
  
  console.log('上傳到 Cloudinary...');
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`上傳失敗: ${uploadResponse.statusText}\\n${errorText}`);
  }
  
  const result = await uploadResponse.json();
  console.log('✓ Cloudinary 上傳成功');
  console.log('Public ID:', result.public_id);
  console.log('URL:', result.secure_url);
  
  return result.secure_url;
}

async function testAnalyzeAPI(imageUrl) {
  console.log('\\n測試圖片分析 API...');
  console.log('Image URL:', imageUrl);
  
  const apiUrl = 'http://localhost:3000/api/v1/recipe/analyze-image';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });
  
  console.log('API Status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`API 請求失敗: ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('\\n=== API 回應 ===');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

async function main() {
  try {
    // Step 1: 上傳到 Cloudinary
    const imageUrl = await uploadToCloudinary();
    
    // Step 2: 測試 API
    const apiResult = await testAnalyzeAPI(imageUrl);
    
    // Step 3: 驗證結果
    if (apiResult.success && apiResult.data) {
      console.log('\\n✓ 測試通過！');
      console.log('偵測到的食材:', apiResult.data.detectedIngredients?.map(i => i.name).join(', '));
    } else {
      console.log('\\n✗ 測試失敗：API 沒有回傳預期的資料');
      process.exit(1);
    }
  } catch (error) {
    console.error('\\n✗ 測試失敗:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
