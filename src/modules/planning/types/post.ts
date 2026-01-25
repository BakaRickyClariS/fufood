/** 購物明細項目 */
export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  imageUrl?: string;
};



/** 建立貼文輸入 */
export type CreatePostInput = {
  listId: string;
  content: string;
  images: string[];
  items: ShoppingItem[];
};
