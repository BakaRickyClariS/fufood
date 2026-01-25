/**
 * 通知詳情頁
 * 用於顯示官方公告等通知的完整內容
 */
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNotificationQuery } from '@/modules/notifications/api';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const NotificationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useNotificationQuery(id || '');

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 pb-24">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-24 h-6" />
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="p-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-24 h-3" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Skeleton className="w-3/4 h-6 mb-4" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-2/3 h-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data?.data?.item) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">找不到此通知</p>
        <Button variant="link" onClick={handleBack}>
          返回
        </Button>
      </div>
    );
  }

  const notification = data.data.item;
  const isOfficial = notification.type === 'system';
  const displayGroupName = isOfficial
    ? 'FuFood Official'
    : notification.groupName || '';

  // 格式化日期
  const formattedDate = new Date(notification.createdAt).toLocaleDateString(
    'zh-TW',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  return (
    <div className="min-h-screen bg-neutral-100 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="-ml-2"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">通知詳情</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Card className="border-0 shadow-sm">
          {/* Meta Info */}
          <CardHeader className="border-b border-gray-100 py-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-500 font-medium">
                {displayGroupName}
              </CardDescription>
              <span className="text-xs text-gray-400">{formattedDate}</span>
            </div>
          </CardHeader>

          {/* Main Content */}
          <CardContent className="pt-4">
            <CardTitle className="text-xl mb-4">{notification.title}</CardTitle>

            {/* Body - Render with line breaks preserved */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationDetailPage;
