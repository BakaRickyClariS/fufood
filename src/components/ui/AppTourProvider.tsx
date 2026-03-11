import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { useTourStore } from '@/store/useTourStore';

// 各流程定義的 Steps
const TOUR_STEPS: Record<string, Step[]> = {
  CREATE_GROUP: [
    {
      target: '.tour-step-create-group',
      content: '歡迎來到 FuFood！這是你的群組管理，點擊這裡建立第一個群組吧。',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.tour-step-share-invite',
      content: '建立好群組後，別忘了分享邀請連結給家人，一起共同管理冰箱！',
      disableBeacon: true,
    },
  ],
  PROFILE: [
    {
      target: '.tour-step-profile-edit',
      content: '在這裡可以更換頭貼、設定暱稱，讓家人更容易辨識你。',
      disableBeacon: true,
    },
    {
      target: '.tour-step-dietary',
      content:
        '設定你的飲食喜好（如：過敏原、偏好口味），AI 會根據這些資訊推薦更適合你的食譜。',
      disableBeacon: true,
    },
  ],
  AI_SCAN: [
    {
      target: '.tour-step-camera-btn',
      content: '試試看我們強大的 AI 食材辨識！點擊相機掃描你的冰箱食材。',
      disableBeacon: true,
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '.tour-step-scan-confirm',
      content: '確認 AI 辨識的品項與預估效期正確後，點擊確認入庫。',
      disableBeacon: true,
      spotlightClicks: true,
    },
  ],
  INVENTORY_WARNING: [
    {
      target: '.tour-step-expire-item',
      content: '注意到部分食材顏色變了嗎？這代表它們即將過期，要趕快處理喔！',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.tour-step-ai-recipe',
      content:
        '點擊這裡，讓 AI 為這個即期食材尋找專屬的食譜靈感，減少食物浪費 ✨',
      disableBeacon: true,
      spotlightClicks: true,
    },
  ],
  RECIPE_SYNC: [
    {
      target: '.tour-step-recipe-consume',
      content:
        '決定好要做這道菜了嗎？點擊消耗食材，如果缺少的食材，可以一鍵加入待買清單！',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.tour-step-shopping-list',
      content: '切換到規劃中心，就能看到剛剛缺少的食材已經自動列入採買清單了。',
      disableBeacon: true,
    },
  ],
  NOTIFICATIONS: [
    {
      target: '.tour-step-notif-center',
      content: '最後，在這裡你可以隨時接收庫存警報、採買動態與家人的加入通知。',
      disableBeacon: true,
    },
  ],
};

export const AppTourProvider = () => {
  const { isActive, currentStep, finishTour } = useTourStore();
  const [shouldRun, setShouldRun] = useState(false);

  // 當 isActive 變為 true 時，給予 DOM 渲染的時間 (特別是 Modal 入場動畫)
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setShouldRun(true);
      }, 500); // 500ms 確保 Modal 已經掛載且動畫完成
      return () => clearTimeout(timer);
    } else {
      setShouldRun(false);
    }
  }, [isActive, currentStep]);

  // 若不在導覽中或是步驟不在定義內，不顯示
  if (!isActive || currentStep === 'LOGIN' || currentStep === 'COMPLETED') {
    return null;
  }

  const steps = TOUR_STEPS[currentStep] || [];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (status === STATUS.SKIPPED) {
        // 使用者點擊跳過，直接結束整個導覽
        finishTour();
      } else if (status === STATUS.FINISHED) {
        // 完成「當前區塊」的步驟，手動推動到下一個邏輯區塊
        if (currentStep === 'CREATE_GROUP') {
          // 完成群組建立與分享教學後，下一個預期動作是去個人設定
          useTourStore.getState().setStep('PROFILE');
        } else if (currentStep === 'INVENTORY_WARNING') {
          // 完成庫存標記與 AI 食譜按鈕提示後，進入食譜同步階段
          useTourStore.getState().setStep('RECIPE_SYNC');
        } else if (currentStep === 'RECIPE_SYNC') {
          // 完成食譜消耗教學後，進入通知中心
          useTourStore.getState().setStep('NOTIFICATIONS');
        } else if (currentStep === 'NOTIFICATIONS') {
          // 最後一步，完成教學
          finishTour();
        }
      }
    }
  };

  return (
    <Joyride
      key={`${currentStep}-${shouldRun}`} // 同時綁定步驟與運行狀態
      steps={steps}
      run={shouldRun}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      disableScrolling={false}
      scrollOffset={100}
      styles={{
        options: {
          primaryColor: '#f97316', // tailwind orange-500
          zIndex: 10000,
        },
      }}
      locale={{
        back: '上一步',
        close: '關閉',
        last: '完成',
        next: '下一步',
        skip: '略過教學',
      }}
    />
  );
};
