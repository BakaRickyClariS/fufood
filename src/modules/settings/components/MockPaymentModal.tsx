import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Loader2, CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

type MockPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: string;
  onConfirm: () => void;
};

const MockPaymentModal = ({
  isOpen,
  onClose,
  planName,
  amount,
  onConfirm,
}: MockPaymentModalProps) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Sync onClose to ref to avoid stale closure in setTimeout
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      // Entrance Animation
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      }
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => onCloseRef.current(),
    });
    if (containerRef.current) {
      tl.to(containerRef.current, { scale: 0.9, opacity: 0, duration: 0.2 });
    }
    if (overlayRef.current) {
      tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '<');
    }
  };

  const handlePayment = async () => {
    setStatus('processing');
    
    // Simulate initial processing delay
    await new Promise(resolve => setTimeout(resolve, 4000));

    try {
      // Trigger data update (wait for it if async)
      await onConfirm();
      
      setStatus('success');
      
      // Auto close after showing success state
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Payment failed', error);
      setStatus('idle'); // Allow retry
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div 
        ref={containerRef}
        className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl"
      >
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500">
            {status === 'success' ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <CreditCard className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-xl font-bold text-neutral-800">
            {status === 'success' ? '付款成功' : '確認付款'}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            (此為模擬付款頁面)
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-3 border-b border-neutral-100">
            <span className="text-neutral-600">商品項目</span>
            <span className="font-medium text-neutral-900">{planName}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-neutral-100">
            <span className="text-neutral-600">應付金額</span>
            <span className="font-bold text-xl text-primary-500">{amount}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            className="w-full h-12 text-lg rounded-xl bg-primary-500 hover:bg-primary-600"
            disabled={status !== 'idle'}
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                處理中...
              </>
            ) : status === 'success' ? (
              '完成'
            ) : (
              '確認付款'
            )}
          </Button>
          
          {status === 'idle' && (
            <button
              onClick={handleClose}
              className="w-full py-3 text-neutral-500 font-medium hover:text-neutral-700 transition-colors"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MockPaymentModal;
