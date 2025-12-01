import React from 'react';
import { CameraCapture } from '@/modules/food-scan/components/features/CameraCapture';
import { useScanInstructions } from '@/modules/food-scan/hooks/useScanInstructions';
import InstructionsModal from '@/modules/food-scan/components/ui/InstructionsModal';

const Upload: React.FC = () => {
  const { showInstructions, dontShowAgain, setDontShowAgain, handleClose } = 
    useScanInstructions();

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden overscroll-none touch-none flex flex-col">
      <CameraCapture />
      <InstructionsModal
        isOpen={showInstructions}
        onClose={handleClose}
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
      />
    </div>
  );
};

export default Upload;
