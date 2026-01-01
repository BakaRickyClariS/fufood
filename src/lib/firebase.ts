import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is present to avoid errors during dev/build if envs are missing
let app;
let messaging: any;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } else {
    console.warn('Firebase config missing, push notifications will not work.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.error('Firebase messaging not initialized.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (!VAPID_KEY) {
        console.error('Missing VAPID Key');
        return null;
      }
      
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
    return null;
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      import('firebase/messaging').then(({ onMessage }) => {
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      });
    }
  });
