import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/modules/auth';
import { useUpdateProfileMutation } from '@/modules/settings/api/queries';
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
// import { toast } from '@/shared/components/ui/use-toast'; // Assuming toast exists

type ProfileFormValues = {
  name: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
};

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      phone: '',
      gender: 'prefer-not-to-say',
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
      setValue('gender', user.gender || 'prefer-not-to-say');
    }
  }, [user, setValue]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(
      {
        name: data.name,
        // phone: data.phone,
        // gender: data.gender,
      },
      {
        onSuccess: () => {
          // toast({ title: '儲存成功', description: '您的個人資料已更新' });
          navigate(-1);
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

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              電話 <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('phone', { required: '請輸入電話號碼' })}
              placeholder="請輸入電話號碼"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">性別</label>
            <Select
              onValueChange={(value) =>
                setValue('gender', value as ProfileFormValues['gender'], {
                  shouldDirty: true,
                })
              }
              defaultValue="prefer-not-to-say"
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇性別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
                <SelectItem value="other">其他</SelectItem>
                <SelectItem value="prefer-not-to-say">不透露</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={!isDirty || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? '儲存中...' : '儲存'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
