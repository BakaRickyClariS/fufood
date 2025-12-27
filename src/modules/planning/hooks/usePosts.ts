import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { SharedListPost, CreatePostInput } from '../types';
import { sharedListApi } from '../services/api/sharedListApi';

export const usePosts = (listId: string | undefined) => {
  const [posts, setPosts] = useState<SharedListPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!listId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sharedListApi.getPosts(listId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const createPost = async (input: CreatePostInput) => {
    setIsLoading(true);
    try {
      const newPost = await sharedListApi.createPost(input);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create post';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!listId) return;
    try {
      await sharedListApi.deletePost(postId, listId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete post';
      toast.error(msg);
      throw err;
    }
  };

  const updatePost = async (postId: string, input: CreatePostInput) => {
    if (!listId) return;
    try {
      const updatedPost = await sharedListApi.updatePost(postId, listId, input);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post)),
      );
      return updatedPost;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update post';
      toast.error(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
};
