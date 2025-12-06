import { useState, useEffect, useCallback } from 'react';
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

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!listId) return;

      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) return;

      const optimisticPost: SharedListPost = {
        ...currentPost,
        isLiked: !currentPost.isLiked,
        likesCount: Math.max(
          0,
          currentPost.likesCount + (currentPost.isLiked ? -1 : 1),
        ),
      };

      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? optimisticPost : post)),
      );

      try {
        const updatedPost = await sharedListApi.togglePostLike(postId, listId);
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? updatedPost : post)),
        );
        return updatedPost;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to toggle like status';
        setError(msg);
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? currentPost : post)),
        );
        throw new Error(msg);
      }
    },
    [listId, posts],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
    createPost,
    toggleLike,
  };
};
