import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const ChangeLayoutButton = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 px-4 w-full max-w-md mx-auto">
      <Button
        variant="outline"
        className="
          w-full h-12 bg-white border-neutral-200 
          text-neutral-900 font-bold text-base rounded-xl 
          shadow-sm hover:bg-neutral-50 active:scale-[0.98]
        "
        onClick={() => navigate('/inventory?tab=settings')}
      >
        變更版型
      </Button>
    </div>
  );
};

export default ChangeLayoutButton;
