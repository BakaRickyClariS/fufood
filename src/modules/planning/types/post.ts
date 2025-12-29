/** 購物明細項目 */
export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  imageUrl?: string;
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
  createdAt: string;
};

/** 建立貼文輸入 */
export type CreatePostInput = {
  listId: string;
  content: string;
  images: string[];
  items: ShoppingItem[];
};
