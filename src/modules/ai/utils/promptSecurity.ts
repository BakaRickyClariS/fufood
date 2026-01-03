/**
 * AI Prompt 安全工具
 *
 * 提供 Prompt Injection 防護與輸入清理功能。
 * 此為前端第一道防線，後端仍需獨立驗證。
 *
 * @module promptSecurity
 */

// ============================================================
// 常數定義
// ============================================================

/**
 * Prompt Injection 偵測模式 (安全性威脅)
 */
const SECURITY_PATTERNS: RegExp[] = [
  // ========== 中文指令繞過 ==========
  /忽略.*指令/i,
  /無視.*規則/i,
  /跳過.*限制/i,
  /你的.*prompt/i,
  /系統.*提示/i,
  /告訴我.*指令/i,
  /輸出.*設定/i,
  /顯示.*配置/i,
  /忘記.*之前/i,
  /重新.*開始/i,

  // ========== 英文指令繞過 ==========
  /ignore.*instruction/i,
  /bypass.*rule/i,
  /reveal.*prompt/i,
  /system.*prompt/i,
  /jailbreak/i,
  /DAN\s*mode/i,
  /pretend.*you.*are/i,
  /act.*as.*if/i,
  /you.*are.*now/i,
  /from.*now.*on/i,
  /override/i,
  /disregard/i,
  /forget.*everything/i,

  // ========== 角色扮演繞過 ==========
  /扮演.*角色/i,
  /假裝.*是/i,
  /roleplay/i,
  /persona/i,

  // ========== 技術性攻擊標記 ==========
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<\|.*\|>/i,
  /\{system\}/i,
  /\{user\}/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
];

/**
 * 非食譜相關主題偵測模式 (離題內容)
 */
const TOPIC_PATTERNS: RegExp[] = [
  // ========== 非食譜相關主題 (Topic Guard) ==========
  /JS.*計數器/i,
  /java.*script/i,
  /python/i,
  /寫.*程式/i,
  /code/i,
  /function/i,
  /class/i,
  /計算機/i,
  /股票/i,
  /天氣/i,
  /新聞/i,
  /翻譯/i,
];

/**
 * 需移除的特殊字元模式
 */
const SANITIZE_PATTERNS: RegExp[] = [
  /[<>{}[\]\\|]/g, // HTML/程式碼相關字元
  /javascript:/gi, // JS 協議
  /data:/gi, // Data URL
  /on\w+\s*=/gi, // 事件處理器
  /vbscript:/gi, // VBScript 協議
];

/**
 * 控制字元範圍（需移除）
 */
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Prompt 最大長度 */
const MAX_PROMPT_LENGTH = 500;

/** 食材名稱最大長度 */
const MAX_INGREDIENT_LENGTH = 50;

/** 最大食材數量 */
const MAX_INGREDIENTS_COUNT = 20;

// ============================================================
// 型別定義
// ============================================================

/** Prompt 錯誤碼 */
export type PromptErrorCode =
  | 'INJECTION_DETECTED'
  | 'INVALID_LENGTH'
  | 'EMPTY_INPUT'
  | 'INVALID_CHARACTERS';

/** Prompt 驗證結果 */
export type PromptValidationResult = {
  /** 是否通過驗證 */
  isValid: boolean;
  /** 清理後的 Prompt */
  sanitized: string;
  /** 驗證失敗原因（使用者友善訊息） */
  reason?: string;
  /** 詳細錯誤碼（供日誌記錄） */
  errorCode?: PromptErrorCode;
  /** 是否需要記錄（可疑但未阻擋） */
  shouldLog?: boolean;
};

// ============================================================
// 核心函式
// ============================================================

/**
 * 驗證並清理用戶輸入的 Prompt
 *
 * @param input - 用戶原始輸入
 * @returns 驗證結果物件
 *
 * @example
 * ```typescript
 * const result = validatePrompt('晚餐想吃日式');
 * if (result.isValid) {
 *   await sendToAI(result.sanitized);
 * } else {
 *   showToast(result.reason, 'error');
 * }
 * ```
 */
export function validatePrompt(input: string): PromptValidationResult {
  // 1. 基本清理：移除首尾空白與控制字元
  const trimmed = input.trim().replace(CONTROL_CHARS, '');

  // 2. 空值檢查
  if (!trimmed) {
    return {
      isValid: false,
      sanitized: '',
      reason: '請輸入您想要的食譜說明',
      errorCode: 'EMPTY_INPUT',
    };
  }

  // 3. 長度檢查
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      sanitized: '',
      reason: `輸入內容過長，請精簡您的描述（最多 ${MAX_PROMPT_LENGTH} 字）`,
      errorCode: 'INVALID_LENGTH',
    };
  }

  // 4a. Injection 模式檢測 (Security)
  for (const pattern of SECURITY_PATTERNS) {
    if (pattern.test(trimmed)) {
      if (import.meta.env.DEV) {
        console.warn(
          '[AI Security] Security pattern detected:',
          pattern.source,
        );
      }

      return {
        isValid: false,
        sanitized: '',
        reason: '輸入內容包含不允許的指令或關鍵字，請重新輸入',
        errorCode: 'INJECTION_DETECTED', // Keep generalized error code
        shouldLog: true,
      };
    }
  }

  // 4b. Topic 模式檢測 (Relevance)
  for (const pattern of TOPIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      if (import.meta.env.DEV) {
        console.warn(
          '[AI Security] Off-topic pattern detected:',
          pattern.source,
        );
      }

      return {
        isValid: false,
        sanitized: '',
        reason: '抱歉，我只能協助您處理食譜相關的問題。', // Backend-aligned message
        errorCode: 'INJECTION_DETECTED',
        shouldLog: true,
      };
    }
  }

  // 5. 清理特殊字元
  let sanitized = trimmed;
  for (const pattern of SANITIZE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // 6. 正規化空白
  sanitized = sanitized
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 7. 最終長度檢查
  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      reason: '清理後的輸入為空，請重新輸入有效內容',
      errorCode: 'INVALID_CHARACTERS',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * 驗證食材名稱陣列
 *
 * @param ingredients - 食材名稱陣列
 * @returns 清理後的食材陣列
 */
export function validateIngredients(ingredients: string[]): string[] {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .map((ing) => ing.trim())
    .filter((ing) => {
      // 長度限制
      if (ing.length === 0 || ing.length > MAX_INGREDIENT_LENGTH) return false;
      // 禁止 HTML/Script 標籤
      if (/<[^>]*>|script/i.test(ing)) return false;
      // 禁止控制字元
      if (CONTROL_CHARS.test(ing)) return false;
      return true;
    })
    .slice(0, MAX_INGREDIENTS_COUNT);
}

/**
 * 快速檢查是否為有效 Prompt
 *
 * @param input - 用戶輸入
 * @returns 是否有效
 */
export function isValidPrompt(input: string): boolean {
  return validatePrompt(input).isValid;
}
