import React from 'react';
import { Check, Tag, Box, FileText, Camera, Image as ImageIcon } from 'lucide-react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { FoodItemInput } from '../../types';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormQuantity from './FormQuantity';
import FormDatePicker from './FormDatePicker';
import FormToggle from './FormToggle';
import FormTextarea from './FormTextarea';

type ScanResultEditFormProps = {
  imageUrl: string;
  register: UseFormRegister<FoodItemInput>;
  control: Control<FoodItemInput>;
  errors: FieldErrors<FoodItemInput>;
  onRetake?: () => void;
  onPickImage?: () => void;
};

const ScanResultEditForm: React.FC<ScanResultEditFormProps> = ({
  imageUrl,
  register,
  control,
  errors,
  onRetake,
  onPickImage,
}) => (
  <div className="bg-white rounded-3xl p-6 relative overflow-visible mt-12 pb-8">
    {/* Floating Image */}
    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
      <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 group">
        <img
          src={imageUrl}
          alt="Product"
          className="w-full h-full object-cover"
        />
        {/* Overlay for actions (optional, or place buttons outside) - Design shows buttons outside top right? No, design shows buttons floating nearby or integrated. 
           Wait, user said "右上角缺少相機和圖庫按鈕" in "編輯草稿頁面". 
           Looking at design: It seems they are floating buttons on the image or near it.
           Let's place them absolutely relative to the image container or the card.
        */}
      </div>
      
      {/* Camera/Gallery Actions - Positioned relative to the image */}
      <div className="absolute -right-12 top-0 flex flex-col gap-2">
         <button type="button" onClick={onRetake} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-red-500">
            <Camera size={16} />
         </button>
         <button type="button" onClick={onPickImage} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-red-500">
            <ImageIcon size={16} />
         </button>
      </div>

      {/* Success Badge */}
      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
        <Check size={16} strokeWidth={3} />
      </div>
    </div>

    <div className="mt-12 mb-8 space-y-4">
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-1">辨識產品名</p>
      </div>
      <FormInput
        label=""
        name="productName"
        register={register}
        error={errors.productName?.message}
        placeholder="輸入產品名稱"
        className="text-center"
        rules={{ required: '請輸入產品名稱' }}
      />
    </div>

    {/* Details List */}
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Tag size={18} />
          <span className="text-sm font-medium">產品分類</span>
        </div>
        <FormSelect
          label=""
          name="category"
          register={register}
          error={errors.category?.message}
          options={[
            { value: '蔬菜', label: '蔬菜' },
            { value: '水果', label: '水果' },
            { value: '肉類', label: '肉類' },
            { value: '海鮮', label: '海鮮' },
            { value: '乳製品', label: '乳製品' },
            { value: '飲品', label: '飲品' },
            { value: '零食', label: '零食' },
            { value: '調味料', label: '調味料' },
            { value: '其他', label: '其他' },
          ]}
          rules={{ required: '請選擇分類' }}
        />
      </div>

      {/* Attributes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Box size={18} />
          <span className="text-sm font-medium">產品屬性</span>
        </div>
        <FormSelect
          label=""
          name="attributes"
          register={register}
          error={errors.attributes?.message}
          options={[
            { value: '常溫', label: '常溫' },
            { value: '冷藏', label: '冷藏' },
            { value: '冷凍', label: '冷凍' },
          ]}
          rules={{ required: '請選擇屬性' }}
        />
      </div>

      {/* Quantity & Unit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">歸納數量</span>
        </div>
        <div className="flex items-center gap-4">
          <FormQuantity
            label=""
            name="purchaseQuantity"
            control={control}
            className="flex-1"
          />
          <div className="w-1/3">
            <FormSelect
              label=""
              name="unit"
              register={register}
              error={errors.unit?.message}
              options={[
                { value: '個', label: '個' },
                { value: '包', label: '包' },
                { value: '瓶', label: '瓶' },
                { value: '罐', label: '罐' },
                { value: '盒', label: '盒' },
                { value: 'kg', label: 'kg' },
                { value: 'g', label: 'g' },
                { value: 'L', label: 'L' },
                { value: 'ml', label: 'ml' },
              ]}
              rules={{ required: '請選擇單位' }}
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-100 my-4" />

      {/* Dates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold border-l-4 border-red-400 pl-2">
          日期設定
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormDatePicker
            label="入庫日期"
            name="purchaseDate"
            control={control}
            error={errors.purchaseDate?.message}
          />
          <FormDatePicker
            label="過期日期"
            name="expiryDate"
            control={control}
            error={errors.expiryDate?.message}
          />
        </div>
      </div>

      <hr className="border-slate-100 my-4" />

      {/* Low Stock Alert */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold border-l-4 border-red-400 pl-2">
          低庫存提醒
        </div>

        <FormToggle label="開啟通知" name="lowStockAlert" control={control} />

        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-bold text-slate-800">
            低於此數量時通知
          </span>
          <FormQuantity
            label=""
            name="lowStockThreshold"
            control={control}
            min={1}
            max={20}
          />
        </div>
      </div>

      <hr className="border-slate-100 my-4" />

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <FileText size={18} />
          <span className="text-sm font-medium">備註</span>
        </div>
        <FormTextarea
          label=""
          name="notes"
          register={register}
          error={errors.notes?.message}
          placeholder="留下您的備註"
          maxLength={20}
        />
      </div>
    </div>
  </div>
);

export default ScanResultEditForm;
