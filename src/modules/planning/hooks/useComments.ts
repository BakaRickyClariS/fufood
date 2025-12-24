import { useState, useCallback, useEffect } from 'react';
import type { PostComment } from '../types';
import { sharedListApi } from '../services/api/sharedListApi';

export const useComments = (postId: string | null) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) {
        setComments([]);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await sharedListApi.getPostComments(postId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!postId) return;
    
    // Optimistic update
    const optimisticComment: PostComment = {
        id: `temp_${Date.now()}`,
        postId,
        authorId: 'current', 
        authorName: 'Me', // Should come from user context ideally, but ok for now
        authorAvatar: 'https://ui-avatars.com/api/?name=Me&background=random',
        content,
        createdAt: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, optimisticComment]);

    try {
      const newComment = await sharedListApi.createPostComment(postId, content);
      // Replace optimistic comment
      setComments(prev => prev.map(c => c.id === optimisticComment.id ? newComment : c));
      return newComment;
    } catch (err) {
      // Revert on error
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      throw err;
    }
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
    refetch: fetchComments,
  };
};
