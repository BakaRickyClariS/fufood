import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const ChangeLayoutButton = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        variant="outline"
        className="
          w-full h-12 bg-white border-neutral-200 border-2
          text-neutral-900 font-bold text-base rounded-xs 
          hover:bg-neutral-50 active:scale-[0.98]
        "
        onClick={() => navigate('/inventory?tab=settings')}
      >
        變更版型
      </Button>
    </div>
  );
};

export default ChangeLayoutButton;
