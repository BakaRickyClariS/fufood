import React, { useEffect, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import gsap from 'gsap';

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
};

const recentSearches = [
  '紅蘿蔔',
  '結球甘藍',
  '番茄',
  '草莓',
  '大陸A菜',
  '花椰菜',
];

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();

      // Animate overlay
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );

      // Animate modal (slide up)
      tl.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.5, ease: 'back.out(1.2)' },
        '-=0.2',
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    // Animate modal (slide down)
    tl.to(modalRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    // Animate overlay
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.3, ease: 'power2.in' },
      '-=0.3',
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(query);
    handleClose();
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full h-[90vh] bg-white max-w-layout-container mx-auto rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            搜尋
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Search Input */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              placeholder="搜尋"
              className="pl-10 pr-10 bg-gray-100 border-none h-12 rounded-xl text-base"
              autoFocus
              value={query}
              onChange={(e) => {
                const newQuery = e.target.value;
                setQuery(newQuery);
                onSearch(newQuery);
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  onSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Recent History */}
        <div className="px-4 mt-2">
          <h3 className="text-base font-bold text-neutral-900 mb-3">
            最近搜尋紀錄
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleTagClick(term)}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm text-neutral-600 flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                {term}
                <X className="w-3 h-3 text-neutral-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
