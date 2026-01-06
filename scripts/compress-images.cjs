/**
 * 圖片壓縮腳本
 * 使用 sharp 將圖片轉換為 WebP 格式（保持原始解析度）
 *
 * 用法：node scripts/compress-images.cjs
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 要處理的目錄（public 和 src/assets）
const DIRS_TO_PROCESS = [
  path.join(__dirname, '..', 'public', 'images'),
  path.join(__dirname, '..', 'src', 'assets', 'images'),
];

// WebP 品質 (1-100)，85 是高品質與壓縮率的平衡點
const QUALITY = 85;

async function compressImage(inputPath, outputPath) {
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;

  // 不做 resize，保持原始解析度
  await sharp(inputPath).webp({ quality: QUALITY }).toFile(outputPath);

  const newStats = fs.statSync(outputPath);
  const newSize = newStats.size;
  const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

  console.log(
    `✓ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024).toFixed(0)}KB, -${savings}%)`,
  );
}

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
      const outputPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      try {
        await compressImage(fullPath, outputPath);
      } catch (err) {
        console.error(`✗ 無法處理 ${entry.name}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('開始壓縮圖片（保持原始解析度）...\n');
  console.log(`WebP 品質: ${QUALITY}\n`);

  for (const dir of DIRS_TO_PROCESS) {
    if (!fs.existsSync(dir)) {
      console.log(`跳過不存在的目錄: ${dir}\n`);
      continue;
    }

    console.log(`處理目錄: ${dir}`);
    console.log('-'.repeat(50));
    await processDirectory(dir);
    console.log('');
  }

  console.log('壓縮完成！');
  console.log(
    '提醒：原始 PNG 檔案未刪除，請手動刪除並更新程式碼中的路徑為 .webp',
  );
}

main().catch(console.error);
