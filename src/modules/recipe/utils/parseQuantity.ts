/**
 * 解析食材數量字串，提取數值和單位
 * @param quantityStr - 數量字串，如 "3-4條"、"500克"、"適量"
 * @returns { quantity: number, unit: string }
 */
export const parseQuantity = (quantityStr: string): { quantity: number; unit: string } => {
  // 預設值
  const defaultResult = { quantity: 1, unit: '份' };
  
  if (!quantityStr || typeof quantityStr !== 'string') {
    return defaultResult;
  }

  // 移除空白
  const trimmed = quantityStr.trim();
  
  // 處理 "適量"、"少許" 等非數字描述
  if (/^(適量|少許|些許|若干)$/.test(trimmed)) {
    return defaultResult;
  }

  // 匹配數字和單位的正則表達式
  // 支援格式：3-4條、500克、2個、1.5公斤
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*-?\s*(\d+(?:\.\d+)?)?\s*(.*)$/);
  
  if (!match) {
    return defaultResult;
  }

  const [, firstNum, , unit] = match;
  
  // 優先取範圍最小值（如 "3-4" 取 3）
  const quantity = parseFloat(firstNum);
  
  // 提取單位，如果沒有則使用預設值
  const extractedUnit = unit.trim() || '份';

  return {
    quantity: isNaN(quantity) ? 1 : quantity,
    unit: extractedUnit
  };
};
