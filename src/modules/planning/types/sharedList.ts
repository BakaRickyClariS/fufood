/** 清單狀態 */
export type SharedListStatus = 'in-progress' | 'pending-purchase' | 'completed';

/** 共享清單 */
export type SharedList = {
  id: string;
  name: string;
  coverImageUrl: string;
  scheduledDate: string; // 預計採買日期 ISO String
  status: SharedListStatus;
  notifyEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  groupId: string; // 所屬群組
};

/** 共享清單列表項目 */
export type SharedListItem = Pick<
  SharedList,
  'id' | 'name' | 'coverImageUrl' | 'scheduledDate' | 'status'
>;

/** 建立清單輸入 */
export type CreateSharedListInput = {
  name: string;
  coverImageUrl: string;
  scheduledDate: string;
  notifyEnabled: boolean;
  groupId: string;
};
