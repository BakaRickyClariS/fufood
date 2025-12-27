import { useRef, useEffect, useState } from 'react';
import { X, Send, User } from 'lucide-react';
import gsap from 'gsap';
import defaultAvatar from '@/assets/images/auth/Avatar-1.png'; // 假設有預設頭像，若無請調整
import type { PostComment } from '@/modules/planning/types';

type CommentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  comments: PostComment[];
  onSubmitComment: (content: string) => void;
};

export const CommentsModal = ({
  isOpen,
  onClose,
  comments,
  onSubmitComment,
}: CommentsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState('');

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
        { y: '100%' },
        { y: '0%', duration: 0.4, ease: 'power3.out' },
        '<'
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(modalRef.current, { y: '100%', duration: 0.3, ease: 'power2.in' });
    tl.to(overlayRef.current, { opacity: 0, duration: 0.3 }, '<');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onSubmitComment(newComment);
    setNewComment('');
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分鐘`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小時`;
    return `${Math.floor(hours / 24)}天`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl h-[85vh] sm:h-[600px] flex flex-col shadow-xl"
      >
        {/* Drag Handle (Mobile) */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="w-8" /> {/* Spacer */}
          <h2 className="text-lg font-bold">留言</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-neutral-300" />
              </div>
              <p>還沒有留言，來搶頭香吧！</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 items-start">
                <img
                  src={comment.authorAvatar || defaultAvatar}
                  alt={comment.authorName}
                  className="w-10 h-10 rounded-full bg-neutral-100 object-cover shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-neutral-900">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-neutral-100 bg-white pb-safe">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
             {/* Current User Avatar - Placeholder */}
             <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                 <img src={defaultAvatar} alt="Me" className="w-full h-full object-cover" />
             </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="好吧...不然先這樣"
                className="w-full pl-5 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-sm focus:outline-none focus:border-neutral-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-1 top-1 w-9 h-9 flex items-center justify-center bg-black text-white rounded-full disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
              >
                <div className={!newComment.trim() ? "rotate-0" : ""}>
                    {/* The design has an arrow up icon. Lucide 'Send' or 'ArrowUp' works. Design shows arrow pointing up. */}
                    <Send className={`w-4 h-4 ${!newComment.trim() ? 'opacity-50' : ''}`} />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
