/**
 * 圖片壓縮腳本
 * 使用 sharp 將圖片轉換為 WebP 格式
 * 支援:
 * 1. 寬度限制 (Max 800px)
 * 2. 多目錄處理 (public/images, src/assets/images)
 * 3. 原地替換 (處理 Windows EBUSY 問題)
 *
 * 用法：node scripts/compress-images.cjs
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 要處理的目錄（public 和 src/assets）
const DIRS_TO_PROCESS = [
  path.join(__dirname, '..', 'public', 'images', 'sharedList'), // 優先處理這需 resize 的
  path.join(__dirname, '..', 'public', 'images', 'recipe'),
  path.join(__dirname, '..', 'src', 'assets', 'images'),
];

// WebP 品質 (1-100)，85 是高品質與壓縮率的平衡點
const QUALITY = 85;
const MAX_WIDTH = 800; // 限制最大寬度

async function compressImage(inputPath, outputPath) {
  // 強制 Resize 到 800px
  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath);
}

async function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const filesToProcess = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
      filesToProcess.push({
        name: entry.name,
        fullPath,
        isWebP: /\.webp$/i.test(entry.name),
      });
    }
  }

  // 1. 批次處理：全部輸出到 temp
  for (const file of filesToProcess) {
    const outputPath = file.fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const tempPath = path.join(dir, `temp_${path.basename(outputPath)}`);

    try {
      await compressImage(file.fullPath, tempPath);
      file.tempPath = tempPath;
      file.targetPath = outputPath;
      console.log(`✓ Processed ${file.name}`);
    } catch (err) {
      console.error(`✗ Failed to process ${file.name}:`, err.message);
    }
  }

  // 2. 緩衝時間
  if (filesToProcess.length > 0) {
    await new Promise((r) => setTimeout(r, 500));
  }

  // 3. 批次替換
  for (const file of filesToProcess) {
    if (!file.tempPath) continue;

    try {
      if (fs.existsSync(file.targetPath)) {
        fs.unlinkSync(file.targetPath);
      }
      fs.renameSync(file.tempPath, file.targetPath);

      // 如果原檔不是 WebP (是 PNG/JPG)，也要刪除原檔嗎？
      // 根據需求，這裡我們假設主要目的是轉 WebP，所以如果是 PNG 來源，我們保留 PNG 還是刪除？
      // 之前的邏輯是保留 PNG (由使用者手動刪除)。
      // 但如果是更新現有的 WebP，我們已經在上面 unlink targetPath 了。
    } catch (err) {
      console.error(`✗ Failed to replace ${file.name}:`, err.message);
    }
  }
}

async function main() {
  console.log(`開始壓縮圖片 (WebP, Max Width: ${MAX_WIDTH}px)...`);

  for (const dir of DIRS_TO_PROCESS) {
    console.log(`\n處理目錄: ${dir}`);
    console.log('-'.repeat(30));
    await processDirectory(dir);
  }

  console.log('\n完成！');
}

main().catch(console.error);
