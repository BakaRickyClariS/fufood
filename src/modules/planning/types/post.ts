/** 購物明細項目 */
export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
};

/** 清單貼文 */
export type SharedListPost = {
  id: string;
  listId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string; // 說明文字（最多40字）
  images: string[]; // 商品照片 URLs
  items: ShoppingItem[]; // 購物明細
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
};

/** 建立貼文輸入 */
export type CreatePostInput = {
  listId: string;
  content: string;
  images: string[];
  items: ShoppingItem[];
};

/** 留言 */
export type PostComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
};
