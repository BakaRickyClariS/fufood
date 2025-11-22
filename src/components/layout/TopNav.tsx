import { ChevronDown, HousePlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import zoeImg from '@/assets/images/inventory/members-zo.png';

export default function TopNav() {
  const [selectedHome, setSelectedHome] = useState('My Home');

  const homeOptions = [
    { label: 'My Home', value: 'My Home' },
    { label: 'JJ Home', value: 'JJ Home' },
    { label: 'Ricky Home', value: 'Ricky Home' },
  ];

  return (
    <div className="sticky top-0 left-0 right-0 bg-white z-40 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Free Badge + Home Selector */}
        <div className="flex items-center gap-3">
          {/* Free Badge */}
          <div className="flex items-center gap-1 bg-[#C48B6B] text-white px-2 py-1 rounded-md shadow-sm">
             <ShieldCheck className="w-4 h-4 text-white" />
             <span className="text-xs font-bold">Free</span>
          </div>

          {/* Home Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-xl font-bold text-neutral-900 px-0 hover:bg-transparent"
              >
                {selectedHome}
                <ChevronDown className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {homeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedHome(option.label)}
                  className={
                    selectedHome === option.label
                      ? 'bg-gray-100'
                      : ''
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="border-t mt-2 pt-2 text-blue-600">
                + 新增群組
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Home Icon + User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="text-neutral-900 hover:bg-transparent">
            <HousePlus className="w-6 h-6" />
          </Button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <img src={zoeImg} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
