import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/modules/auth';
import { useUpdateProfileMutation } from '@/modules/settings/api/queries';
import { useGetUserProfileQuery } from '@/modules/auth/api/queries';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import SimpleHeader from '@/modules/settings/components/SimpleHeader';
import AvatarEditor from '@/modules/settings/components/AvatarEditor';
import { Gender, type GenderValue } from '@/modules/auth/types';
import { SuccessModal } from '@/shared/components/ui/SuccessModal';
// import { toast } from '@/shared/components/ui/use-toast'; // Assuming toast exists

/**
 * 表單值類型
 * 對應後端 API 欄位
 */
type ProfileFormValues = {
  name: string;
  email: string;
  gender: string;  // 以字串儲存數值，方便 Select 元件使用
  customGender: string;
};

/**
 * 字串性別值轉換為 API 數值
 */
const stringToGenderValue = (str: string): GenderValue => {
  const num = parseInt(str, 10);
  if (num >= 0 && num <= 4) return num as GenderValue;
  return Gender.NotSpecified;
};

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // 主動呼叫 Query 確保最新資料（優先使用 fetch 回來的資料）
  const { data: latestUserData } = useGetUserProfileQuery();
  const effectiveUser = latestUserData || user;

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const updateProfileMutation = useUpdateProfileMutation();

  // 使用 memo 化的資料作為表單初始值，當使用者資料載入或更新時自動重設表單
  const initialValues = useMemo(() => {
    if (!effectiveUser) return undefined;
    const userGender = effectiveUser.gender ?? Gender.NotSpecified;
    return {
      name: effectiveUser.name || '',
      email: effectiveUser.email || '',
      gender: String(userGender),
      customGender: userGender === Gender.Other ? (effectiveUser.customGender || '') : '',
    };
  }, [effectiveUser]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    values: initialValues,
  });

  const selectedGender = watch('gender');

  const onSubmit = (data: ProfileFormValues) => {
    const genderValue = stringToGenderValue(data.gender);
    
    updateProfileMutation.mutate(
      {
        data: {
          name: data.name,
          email: data.email || undefined,
          gender: genderValue,
          customGender: genderValue === Gender.Other ? data.customGender : null,
        },
      },
      {
        onSuccess: () => {
          // 顯示成功彈跳視窗
          setShowSuccessModal(true);
        },
        onError: (error) => {
          console.error('Update failed', error);
          // toast({ title: '儲存失敗', variant: 'destructive' });
        },
      },
    );
  };

  const handleAvatarEdit = () => {
    // Implement avatar upload logic or modal here
    console.log('Edit avatar');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SimpleHeader title="編輯個人檔案" onBack={() => navigate(-1)} />

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <AvatarEditor
            src={getUserAvatarUrl(user)}
            alt={user?.name || 'User'}
            onEdit={handleAvatarEdit}
          />
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Read-only LINE ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              LINE ID
            </label>
            <Input
              value={user?.lineId || '未綁定'}
              readOnly
              disabled
              className="bg-neutral-100 text-neutral-500"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              使用者名稱 <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name', { required: '請輸入使用者名稱' })}
              placeholder="請輸入名稱"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              電子郵件
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="請輸入電子郵件"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">性別</label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇性別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(Gender.NotSpecified)}>不透露</SelectItem>
                    <SelectItem value={String(Gender.Female)}>女</SelectItem>
                    <SelectItem value={String(Gender.Male)}>男</SelectItem>
                    <SelectItem value={String(Gender.NonBinary)}>無性別</SelectItem>
                    <SelectItem value={String(Gender.Other)}>其他</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Custom Gender (顯示於 gender = 4 時) */}
          {selectedGender === String(Gender.Other) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                自訂性別
              </label>
              <Input
                {...register('customGender', { maxLength: 10 })}
                placeholder="請輸入自訂性別文字（最長 10 字元）"
                maxLength={10}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={!isDirty || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? '儲存中...' : '儲存'}
          </Button>
        </form>
      </div>

      {/* 儲存成功彈跳視窗 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate(-1);
        }}
        title="儲存成功！"
        autoCloseMs={1500}
      />
    </div>
  );
};

export default EditProfile;
