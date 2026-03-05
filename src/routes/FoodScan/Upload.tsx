import React from 'react';
import { useSelector } from 'react-redux';
import { CameraCapture } from '@/modules/food-scan/components/features/CameraCapture';
import { useScanInstructions } from '@/modules/food-scan/hooks/useScanInstructions';
import InstructionsModal from '@/modules/food-scan/components/ui/InstructionsModal';
import ScanResultModal from './ScanResult';
import type { RootState } from '@/store';

const Upload: React.FC = () => {
  const { showInstructions, dontShowAgain, setDontShowAgain, handleClose } =
    useScanInstructions();

  const { items } = useSelector((state: RootState) => state.batchScan);
  const isResultModalOpen = items.length > 0;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden overscroll-none touch-none flex flex-col">
      <CameraCapture />
      <InstructionsModal
        isOpen={showInstructions}
        onClose={handleClose}
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
      />
      <ScanResultModal
        isOpen={isResultModalOpen}
        onClose={() => {
          // onClose 會由 ScanResultModal 內部按鈕處理 batch reset，這裡不需額外 dispatch，只需提供 function prop 如果需要的話
        }}
      />
    </div>
  );
};

export default Upload;
