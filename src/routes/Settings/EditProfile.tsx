import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/modules/auth';
import { useUpdateProfileMutation } from '@/modules/settings/api/queries';
import { useGetUserProfileQuery } from '@/modules/auth/api/queries';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import ProfileAvatar from '@/modules/settings/components/ProfileAvatar';
import { Gender, type GenderValue } from '@/modules/auth/types';
import { SuccessModal } from '@/shared/components/ui/SuccessModal';
import {
  ThemeSelectionSheet,
  CurrentThemeCard,
} from '@/shared/components/modals/ThemeSelectionSheet';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { getThemeById } from '@/shared/constants/themes';
import {
  openThemeSelection,
  selectThemeSelectionIsOpen,
} from '@/store/slices/themeSelectionSlice';
import { useTourStore } from '@/store/useTourStore';

/**
 * 表單值類型
 * 對應後端 API 欄位
 */
type ProfileFormValues = {
  name: string;
  email: string;
  gender: string; // 以字串儲存數值，方便 Select 元件使用
  customGender: string;
  themeId: number;
};

/**
 * 字串性別值轉換為 API 數值
 */
const stringToGenderValue = (str: string): GenderValue => {
  const num = parseInt(str, 10);
  if (num >= 0 && num <= 4) return num as GenderValue;
  return Gender.NotSpecified;
};

type EditProfileProps = {
  isOpen: boolean;
  onClose: () => void;
};

const EditProfile = ({ isOpen, onClose }: EditProfileProps) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  // 主動呼叫 Query 確保最新資料（優先使用 fetch 回來的資料）
  const { data: latestUserData } = useGetUserProfileQuery();
  const effectiveUser = latestUserData || user;

  // 主題系統
  const { setTheme, currentThemeId } = useTheme();

  // 使用 Redux 狀態驅動 modal 顯示，支援重整時恢復
  const showThemeSheet = useSelector(selectThemeSelectionIsOpen);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const updateProfileMutation = useUpdateProfileMutation();
  const { setStep } = useTourStore();

  // 使用 memo 化的資料作為表單初始值，當使用者資料載入或更新時自動重設表單
  const initialValues = useMemo(() => {
    if (!effectiveUser) return undefined;
    const userGender = effectiveUser.gender ?? Gender.NotSpecified;
    return {
      name: effectiveUser.name || '',
      email: effectiveUser.email || '',
      gender: String(userGender),
      customGender:
        userGender === Gender.Other ? effectiveUser.customGender || '' : '',
      themeId: currentThemeId,
    };
  }, [effectiveUser, currentThemeId]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    values: initialValues,
  });

  const selectedGender = watch('gender');
  const selectedThemeId = watch('themeId');
  const selectedTheme = getThemeById(selectedThemeId);
  const userName = effectiveUser?.name || 'User';

  // 處理開啟主題選擇面板
  const handleOpenThemeSheet = () => {
    dispatch(
      openThemeSelection({
        selectedThemeId: selectedThemeId,
        userName: userName,
      }),
    );
  };

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
        onSuccess: async () => {
          // 儲存主題設定
          await setTheme(data.themeId);
          // 推進導覽進度
          setStep('AI_SCAN');
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

  const handleThemeConfirm = (themeId: number) => {
    setValue('themeId', themeId, { shouldDirty: true });
  };

  return (
    <SettingsModalLayout isOpen={isOpen} onClose={onClose} title="編輯個人檔案">
      <div className="max-w-layout-container mx-auto px-4 pt-6 pb-32 space-y-6">
        {/* Avatar Section - 顯示 LINE 大頭貼 */}
        <div className="flex justify-center">
          <ProfileAvatar
            lineProfilePictureUrl={effectiveUser?.pictureUrl}
            alt={userName}
          />
        </div>

        {/* 目前角色區塊 - 點擊變更開啟主題選擇 */}
        <div className="tour-step-profile-edit">
          <CurrentThemeCard
            theme={selectedTheme}
            onChangeClick={handleOpenThemeSheet}
          />
        </div>

        {/* 主題選擇底部彈出面板 */}
        <ThemeSelectionSheet
          isOpen={showThemeSheet}
          onClose={() => {}} // 關閉由 ThemeSelectionSheet 內部處理
          onConfirm={handleThemeConfirm}
          currentThemeId={selectedThemeId}
          isFirstLogin={false}
        />

        {/* Form Section */}
        <form
          id="profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="tour-step-dietary space-y-4 bg-white p-4 rounded-2xl"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              使用者名稱 <span className="text-primary-500">*</span>
            </label>
            <Input
              {...register('name', { required: '請輸入使用者名稱' })}
              placeholder="請輸入名稱"
            />
            {errors.name && (
              <p className="text-sm text-primary-500">{errors.name.message}</p>
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
              <p className="text-sm text-primary-500">{errors.email.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">性別</label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇性別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(Gender.NotSpecified)}>
                      不透露
                    </SelectItem>
                    <SelectItem value={String(Gender.Female)}>女</SelectItem>
                    <SelectItem value={String(Gender.Male)}>男</SelectItem>
                    <SelectItem value={String(Gender.NonBinary)}>
                      無性別
                    </SelectItem>
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
        </form>
      </div>

      {/* 固定在底部的儲存按鈕（與 Recipe 食譜樣式一致） */}
      <div className="fixed bottom-0 left-0 right-0 max-w-layout-container mx-auto px-4 py-6 bg-white rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50">
        <Button
          type="submit"
          form="profile-form"
          className="w-full h-[52px] bg-[#F5655D] hover:bg-[#E5554D] text-white rounded-xl font-bold text-base transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          disabled={!isDirty || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? '儲存中...' : '儲存'}
        </Button>
      </div>

      {/* 儲存成功彈跳視窗 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="儲存成功！"
        autoCloseMs={1500}
      />
    </SettingsModalLayout>
  );
};

export default EditProfile;
