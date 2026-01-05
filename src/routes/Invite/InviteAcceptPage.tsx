import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { groupsApi } from '@/modules/groups/api';
import {
  fetchGroups,
  selectAllGroups,
} from '@/modules/groups/store/groupsSlice';
import { setActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { useAuth } from '@/modules/auth';
import { getGroupLimit } from '@/modules/groups/constants/membershipLimits';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import type { InvitationResponse } from '@/modules/groups/types/group.types';
import type { AppDispatch, RootState } from '@/store';

type InviteStatus =
  | 'checking-auth'
  | 'loading'
  | 'valid'
  | 'expired'
  | 'error'
  | 'joining'
  | 'success';

/**
 * 邀請接受頁面
 * 處理掃描 QR Code 後的加入群組流程
 * 流程：檢查登入 → 未登入導向登入 → 驗證邀請 → 確認加入
 */
const InviteAcceptPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  // Get current groups to check limits
  const currentGroups = useSelector((state: RootState) =>
    selectAllGroups(state),
  );

  const [status, setStatus] = useState<InviteStatus>('checking-auth');
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState<string>('');

  // 步驟 1: 檢查登入狀態
  useEffect(() => {
    // 確保已載入群組資料以檢查限制
    if (isAuthenticated) {
      dispatch(fetchGroups());
    }
  }, [dispatch, isAuthenticated]);

  // 步驟 1: 檢查登入狀態
  useEffect(() => {
    // 等待認證狀態載入完成
    if (isAuthLoading) {
      setStatus('checking-auth');
      return;
    }

    // 未登入則導向登入頁面，並帶上返回 URL
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/auth/login?redirect=${returnUrl}`, { replace: true });
      return;
    }

    // 已登入，開始驗證邀請
    setStatus('loading');
  }, [isAuthenticated, isAuthLoading, navigate]);

  // 步驟 2: 驗證邀請 token（僅在已登入後執行）
  useEffect(() => {
    const validateInvitation = async () => {
      if (status !== 'loading' || !token) {
        return;
      }

      try {
        const data = await groupsApi.getInvitation(token);

        // 檢查是否過期
        if (new Date(data.expiresAt) < new Date()) {
          setStatus('expired');
          return;
        }

        setInvitation(data);
        setStatus('valid');
      } catch (err) {
        console.error('驗證邀請失敗:', err);
        setStatus('error');
        setError('邀請連結無效或已過期');
      }
    };

    validateInvitation();
  }, [status, token]);

  // 處理加入群組
  const handleJoin = async () => {
    if (!invitation?.refrigeratorId || !token) return;

    // 檢查群組數量限制
    const limit = getGroupLimit(user?.membershipTier);
    if (currentGroups.length >= limit) {
      // 檢查是否已經是成員（避免重複加入被擋）
      const isAlreadyMember = currentGroups.some(
        (g) => g.id === invitation.refrigeratorId,
      );
      if (!isAlreadyMember) {
        setStatus('error');
        setError(
          `您的會員方案最多只能加入 ${limit} 個群組。請先升級方案或退出其他群組。`,
        );
        return;
      }
    }

    setStatus('joining');

    try {
      await groupsApi.join(invitation.refrigeratorId, {
        invitationToken: token,
      });

      // ✅ 1. 設定活動冰箱為新加入的群組
      dispatch(setActiveRefrigeratorId(invitation.refrigeratorId));

      // ✅ 2. 刷新群組列表
      dispatch(fetchGroups());

      setStatus('success');

      // 發送推播通知 (通知群組其他成員)
      try {
        const joinerName = user?.displayName || user?.name || '新成員';
        const groupName = invitation.refrigeratorName || '我的冰箱';
        import('@/api/services/notification').then(
          ({ notificationService }) => {
            notificationService
              .sendNotification({
                type: 'group',
                subType: 'member',
                title: '群組成員變動',
                body: `${joinerName} 已加入群組`,
                groupId: invitation.refrigeratorId,
                // 補上操作者資訊
                group_name: groupName,
                actor_name: joinerName,
                actor_id: user?.id,
                action: {
                  type: 'detail',
                  payload: {
                    refrigeratorId: invitation.refrigeratorId,
                  },
                },
              })
              .catch((err) =>
                console.error('Failed to send join notification:', err),
              );
          },
        );
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
      }

      // 成功後導向 dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('加入群組失敗:', err);
      setStatus('error');
      setError('加入群組失敗，請稍後再試');
    }
  };

  // 檢查登入狀態中
  if (status === 'checking-auth' || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <p className="text-neutral-500">檢查登入狀態...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            <p className="text-neutral-500">驗證邀請中...</p>
          </div>
        )}

        {/* Valid Invitation */}
        {status === 'valid' && invitation && (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary-500" />
              </div>

              <h1 className="text-xl font-bold text-neutral-900 text-center">
                邀請加入群組
              </h1>

              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-neutral-800">
                  {invitation.refrigeratorName || '我的冰箱'}
                </p>
                {invitation.inviterName && (
                  <p className="text-sm text-neutral-500">
                    由 {invitation.inviterName} 邀請
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleJoin}
              className="w-full h-14 bg-primary-400 hover:bg-primary-500 text-white text-lg font-bold rounded-xl"
            >
              {isAuthenticated ? '確認加入' : '登入並加入'}
            </Button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-center text-neutral-500 text-sm hover:text-neutral-700"
            >
              取消
            </button>
          </>
        )}

        {/* Joining */}
        {status === 'joining' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            <p className="text-neutral-500">正在加入群組...</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">加入成功！</h2>
            <p className="text-neutral-500">即將跳轉到首頁...</p>
          </div>
        )}

        {/* Expired */}
        {status === 'expired' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">邀請已過期</h2>
            <p className="text-neutral-500 text-center">
              此邀請連結已過期，請聯繫邀請者重新產生邀請
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-4"
            >
              返回首頁
            </Button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">邀請無效</h2>
            <p className="text-neutral-500 text-center">{error}</p>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-4"
            >
              返回首頁
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteAcceptPage;
