/** 清單狀態 */
export type SharedListStatus = 'in-progress' | 'completed';

/** 共享清單 */
export type SharedList = {
  id: string;
  title: string;
  coverPhotoPath: string | null;
  startsAt: string; // ISO String
  refrigeratorId: string;
  enableNotifications: boolean;
  items?: SharedListItem[]; // 取得單一清單時才會有
  createdAt: string;
  updatedAt?: string;
  // 前端計算欄位
  status?: SharedListStatus;
};

/** 共享清單項目 (API) */
export type SharedListItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  photoPath: string | null;
  creatorId: string;
  shoppingListId: string;
  createdAt: string;
  updatedAt: string;
};

/** 建立清單輸入 */
export type CreateSharedListInput = {
  title: string;
  coverPhotoPath?: string;
  startsAt: string;
  enableNotifications?: boolean;
};

/** 建立/更新清單項目輸入 */
export type CreateSharedListItemInput = {
  name: string;
  quantity?: number;
  unit?: string;
  photoPath?: string;
};

/** 共享清單貼文 (前端模擬用) */
export type SharedListPost = {
  id: string;
  listId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images: string[];
  items: (SharedListItem & { imageUrl?: string | null })[]; // Merge photoPath/imageUrl
  createdAt: string;
};

