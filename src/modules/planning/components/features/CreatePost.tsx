import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Trash2, Minus } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useSharedListItems } from '@/modules/planning/hooks/useSharedListItems';
import { mediaApi } from '@/modules/media/api/mediaApi';
import { useNotificationMetadata } from '@/modules/notifications/hooks/useNotificationMetadata';
import type { ShoppingItem, SharedListItem } from '@/modules/planning/types';

const UNITS = [
  '個',
  '包',
  '條',
  '罐',
  '瓶',
  '盒',
  '袋',
  '台斤',
  '公克',
  '公斤',
  'ml',
  'L',
];

const UnitSelector = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -10, scaleY: 0.95 },
        { opacity: 1, y: 0, scaleY: 1, duration: 0.2, ease: 'power2.out' },
      );
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between bg-white transition-all ${
          isOpen
            ? 'border-primary-default ring-1 ring-primary-default'
            : 'border-neutral-200'
        }`}
      >
        <span className={value ? 'text-neutral-800' : 'text-neutral-400'}>
          {value || '請選擇單位'}
        </span>
        <ChevronLeft
          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : '-rotate-90'
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-[100] max-h-60 overflow-y-auto origin-top"
        >
          {UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => {
                onChange(unit);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors ${
                value === unit
                  ? 'text-primary-default font-bold bg-primary-light/10'
                  : 'text-neutral-600'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

type PostFormProps = {
  listId?: string;
  mode: 'create' | 'edit';
  initialData?: SharedListItem | null; // Keep for backward compatibility or single item edit
  initialItems?: SharedListItem[]; // New: support multiple items
  onClose: () => void;
};

export const PostFormFeature = ({
  listId,
  mode,
  initialData,
  initialItems,
  onClose,
  refrigeratorId,
  listName,
}: PostFormProps & { refrigeratorId?: string; listName?: string }) => {
  const { createItems, updateItem, deleteItem } = useSharedListItems(listId);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 取得通知 metadata（群組名稱和操作者資訊）
  const { groupName, actorName, actorId } =
    useNotificationMetadata(refrigeratorId);

  // Note: content is removed as Item API does not support it
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track original IDs to detect deletions in edit mode
  const [originalIds, setOriginalIds] = useState<Set<string>>(new Set());

  // Track which item is currently uploading an image
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  // Store pending files for batch upload execution
  const [pendingUploads, setPendingUploads] = useState<Record<string, File>>(
    {},
  );

  // Initialize data for edit mode or create mode
  useEffect(() => {
    if (mode === 'edit') {
      let mappedItems: ShoppingItem[] = [];

      if (initialItems && initialItems.length > 0) {
        mappedItems = initialItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          imageUrl: item.photoPath || undefined,
        }));
      } else if (initialData) {
        mappedItems = [
          {
            id: initialData.id,
            name: initialData.name,
            quantity: initialData.quantity,
            unit: initialData.unit,
            imageUrl: initialData.photoPath || undefined,
          },
        ];
      }

      setItems(mappedItems);
      setOriginalIds(new Set(mappedItems.map((i) => i.id)));
    } else if (mode === 'create') {
      // Default empty item for create mode
      setItems([
        {
          id: `item_${Date.now()}`,
          name: '',
          quantity: 1,
          unit: '',
        },
      ]);
      setOriginalIds(new Set());
    }
  }, [mode, initialData, initialItems]);

  // GSAP Animation
  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        x: '100%',
        duration: 0.5,
        ease: 'power2.out',
      });
    },
    { scope: containerRef },
  );

  const handleClose = () => {
    gsap.to(containerRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const handleAddItem = () => {
    const newItem: ShoppingItem = {
      id: `item_${Date.now()}`,
      name: '',
      quantity: 1,
      unit: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof ShoppingItem,
    value: any,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleUploadClick = (itemId: string) => {
    setUploadingItemId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingItemId) return;

    // Reset input value so same file can be selected again if needed
    e.target.value = '';

    // 1. Create local preview URL
    const previewUrl = URL.createObjectURL(file);

    // 2. Update item with preview URL
    handleUpdateItem(uploadingItemId, 'imageUrl', previewUrl);

    // 3. Store file in pendingUploads
    setPendingUploads((prev) => ({
      ...prev,
      [uploadingItemId]: file,
    }));

    setUploadingItemId(null);
  };

  // 元件卸載時清理 blob URL，釋放記憶體資源
  useEffect(() => {
    // 保存當前的 items 參照，用於 cleanup 時存取
    const currentItems = items;
    return () => {
      currentItems.forEach((item) => {
        if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.imageUrl);
        }
      });
    };
  }, [items]);

  const handleRemoveImage = (itemId: string) => {
    handleUpdateItem(itemId, 'imageUrl', undefined);
  };

  // 處理數量增減
  const handleQuantityChange = (id: string, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const newQuantity = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQuantity };
      }),
    );
  };

  const handleSubmit = async () => {
    if (!listId) return;

    // Filter out empty items (no name)
    const validItems = items.filter((item) => item.name.trim() !== '');

    if (validItems.length === 0) {
      toast.warning('請至少新增一個商品');
      return;
    }

    setIsSubmitting(true);
    let toastId;

    try {
      toastId = toast.loading('正在處理...');

      // 1. Process pending uploads
      const processedItems = [...validItems];
      const uploadPromises: Promise<void>[] = [];

      for (let i = 0; i < processedItems.length; i++) {
        const item = processedItems[i];
        const pendingFile = pendingUploads[item.id];

        if (pendingFile) {
          uploadPromises.push(
            (async () => {
              try {
                const url = await mediaApi.uploadImage(pendingFile);
                processedItems[i] = { ...item, imageUrl: url };
              } catch (error) {
                console.error(
                  `Failed to upload image for item ${item.name}`,
                  error,
                );
                processedItems[i] = { ...item, imageUrl: undefined };
                toast.error(`商品 ${item.name} 圖片上傳失敗`);
              }
            })(),
          );
        }
      }

      if (uploadPromises.length > 0) {
        toast.loading(`正在上傳 ${uploadPromises.length} 張圖片...`, {
          id: toastId,
        });
        await Promise.all(uploadPromises);
      }

      if (mode === 'edit') {
        const currentIds = new Set(processedItems.map((i) => i.id));

        // 1. Identify Deletions (In original but not in current)
        const itemsToDelete = Array.from(originalIds).filter(
          (id) => !currentIds.has(id),
        );

        // 2. Identify Updates (In original and in current)
        const itemsToUpdate = processedItems.filter((item) =>
          originalIds.has(item.id),
        );

        // 3. Identify Creations (Not in original)
        const itemsToCreate = processedItems.filter(
          (item) => !originalIds.has(item.id),
        );

        const promises: Promise<any>[] = [];

        // Execute Deletes
        itemsToDelete.forEach((id) => {
          promises.push(deleteItem(id));
        });

        // Execute Updates
        itemsToUpdate.forEach((item) => {
          // Only update if needed? For now update all common fields
          promises.push(
            updateItem(item.id, {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              photoPath: item.imageUrl,
            }),
          );
        });

        // Execute Creates
        if (itemsToCreate.length > 0) {
          const createInputs = itemsToCreate.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            photoPath: item.imageUrl,
          }));
          promises.push(createItems(createInputs));
        }

        await Promise.all(promises);

        // 發送更新通知（俏皮風格，統一 metadata）
        try {
          const { notificationsApiImpl } = await import(
            '@/modules/notifications/api/notificationsApiImpl'
          );
          const displayListName = listName || '採買清單';
          await notificationsApiImpl.sendNotification({
            groupId: refrigeratorId || listId,
            title: `「${displayListName}」清單內容變更！`,
            body: `採買小隊報告！「${displayListName}」已有異動，請各位確認！`,
            type: 'shopping',
            subType: 'list',
            groupName,
            actorName,
            actorId,
            group_name: groupName,
            actor_name: actorName,
            actor_id: actorId,
            action: {
              type: 'shopping-list',
              payload: { listId },
            },
          });
        } catch (nErr) {
          console.warn('通知失敗', nErr);
        }

        toast.dismiss(toastId);
        toast.success('更新成功');
      } else {
        // Create mode: Create multiple items
        const createInputs = processedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          photoPath: item.imageUrl,
        }));
        await createItems(createInputs);

        // 發送新增項目的通知（俏皮風格，帶入清單名稱）
        try {
          const { notificationsApiImpl } = await import(
            '@/modules/notifications/api/notificationsApiImpl'
          );
          const displayListName = listName || '採買清單';
          const firstItem = processedItems[0].name;
          const count = processedItems.length;
          const title =
            count > 1
              ? `${firstItem} 等 ${count} 項商品加入「${displayListName}」！`
              : `${firstItem} 加入「${displayListName}」！`;
          const body =
            count > 1
              ? `採買小隊報告！${count} 項新任務已登錄至「${displayListName}」！`
              : `採買小隊報告！${firstItem} 已加入「${displayListName}」，收到請回報！`;

          await notificationsApiImpl.sendNotification({
            groupId: refrigeratorId || listId,
            title,
            body,
            type: 'shopping',
            subType: 'list',
            groupName,
            actorName,
            actorId,
            group_name: groupName,
            actor_name: actorName,
            actor_id: actorId,
            action: {
              type: 'shopping-list',
              payload: { listId },
            },
          });
        } catch (nErr) {
          console.warn('通知失敗', nErr);
        }

        toast.dismiss(toastId);
        toast.success('新增成功');
      }
      handleClose();
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(mode === 'create' ? '發布失敗' : '更新失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-0 bottom-0 left-0 right-0 max-w-layout-container mx-auto z-100 bg-neutral-100 flex flex-col"
    >
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-neutral-100 shadow-sm shrink-0">
        <button onClick={handleClose} className="p-1">
          <ChevronLeft className="w-6 h-6 text-neutral-700" />
        </button>
        <h1 className="text-base font-bold text-neutral-800">
          {mode === 'create' ? '新增採買清單' : '編輯採買清單'}
        </h1>
      </header>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4"
        ref={contentRef}
      >
        {/* Shopping Items List */}
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-5 space-y-4">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary-default rounded-full" />
                <h3 className="font-bold text-neutral-800">購物明細</h3>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="flex items-center gap-1 text-primary-default text-sm font-medium active:opacity-70"
              >
                <Trash2 className="w-4 h-4" />
                刪除
              </button>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-neutral-800">
                商品名
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  handleUpdateItem(item.id, 'name', e.target.value)
                }
                placeholder="Add value"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-800 placeholder:text-neutral-300 focus:border-primary-default focus:ring-1 focus:ring-primary-default bg-white outline-none"
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <label className="text-base font-bold text-neutral-800">
                商品數量
              </label>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="w-8 h-8 rounded-full bg-primary-light text-neutral-800 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-lg font-mono font-medium min-w-[1ch] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-primary-light text-neutral-800 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-neutral-800">
                單位
              </label>
              <div className="relative">
                <UnitSelector
                  value={item.unit}
                  onChange={(val) => handleUpdateItem(item.id, 'unit', val)}
                />
              </div>
            </div>

            {/* Add/Show Photo */}
            {item.imageUrl ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden group bg-neutral-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleUploadClick(item.id)}
                disabled={!!uploadingItemId}
                className="w-full py-3 rounded-xl border border-neutral-200 flex items-center justify-center gap-2 text-neutral-800 font-bold bg-white hover:bg-neutral-50 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {uploadingItemId === item.id ? '上傳中...' : '新增商品照'}
              </button>
            )}
          </div>
        ))}

        {/* Add Item Button - Only show in CREATE mode */}
        {mode === 'create' && (
          <button
            onClick={handleAddItem}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 flex items-center justify-center gap-2 hover:bg-white/50 active:scale-98 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-layout-container mx-auto px-4 py-6 bg-white rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0}
          className="w-full py-3.5 bg-primary-default text-white rounded-xl font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all"
        >
          {isSubmitting
            ? mode === 'create'
              ? '發布中...'
              : '更新中...'
            : mode === 'create'
              ? '確認新增'
              : '更新項目'}
        </button>
      </div>
    </div>
  );
};
