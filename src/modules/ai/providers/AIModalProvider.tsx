import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { AIQueryModal } from '@/modules/ai/components/AIQueryModal';
import type { RecipeListItem } from '@/modules/recipe/types';

type AIModalState = {
  initialQuery?: string;
  initialSelectedIngredients?: string[];
  initialRecipes?: RecipeListItem[];
  useStreaming?: boolean;
  autoGenerate?: boolean;
  mode?: 'default' | 'inspiration';
};

type AIModalContextType = {
  /** 開啟 AI Modal */
  openAIModal: (options?: AIModalState) => void;
  /** 關閉 AI Modal */
  closeAIModal: () => void;
  /** Modal 是否開啟 */
  isOpen: boolean;
};

const AIModalContext = createContext<AIModalContextType | undefined>(undefined);

type AIModalProviderProps = {
  children: ReactNode;
};

/**
 * AI Modal Provider - 提供全局 AI Modal 控制
 * 使用 URL query param `modal=ai-query` 控制開關狀態
 */
export const AIModalProvider = ({ children }: AIModalProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalState, setModalState] = useState<AIModalState>({});

  // 從 URL 判斷 Modal 是否開啟
  const isOpen = searchParams.get('modal') === 'ai-query';

  const openAIModal = useCallback(
    (options: AIModalState = {}) => {
      setModalState(options);
      const params = new URLSearchParams(searchParams);
      params.set('modal', 'ai-query');
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const closeAIModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('modal');
    setSearchParams(params);
    // 延遲清除狀態，等動畫結束
    setTimeout(() => setModalState({}), 300);
  }, [searchParams, setSearchParams]);

  return (
    <AIModalContext.Provider value={{ openAIModal, closeAIModal, isOpen }}>
      {children}

      {/* 全局 AI Modal 渲染 */}
      <AIQueryModal
        isOpen={isOpen}
        onClose={closeAIModal}
        initialQuery={modalState.initialQuery}
        initialSelectedIngredients={modalState.initialSelectedIngredients}
        initialRecipes={modalState.initialRecipes}
        useStreaming={modalState.useStreaming}
        autoGenerate={modalState.autoGenerate}
        mode={modalState.mode}
      />
    </AIModalContext.Provider>
  );
};

/**
 * Hook to access AI Modal controls
 */
export const useAIModal = () => {
  const context = useContext(AIModalContext);
  if (context === undefined) {
    throw new Error('useAIModal must be used within an AIModalProvider');
  }
  return context;
};
