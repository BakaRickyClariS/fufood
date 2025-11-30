// components/feedback/SWPrompt.tsx
import React from 'react';

export type SWPromptProps = {
  onUpdate: () => void;
  onClose: () => void;
  show: boolean;
};

export const SWPrompt: React.FC<SWPromptProps> = ({
  onUpdate,
  onClose,
  show,
}) =>
  show ? (
    <div className="sw-modal">
      有新版本可用！
      <button onClick={onUpdate}>更新</button>
      <button onClick={onClose}>關閉</button>
    </div>
  ) : null;

export default SWPrompt;
