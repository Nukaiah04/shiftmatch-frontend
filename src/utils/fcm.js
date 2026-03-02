import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

export const setupFCM = async (setLiveNotification, audioRef) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log("✅ FCM TOKEN:", token);

    // Foreground listener
    onMessage(messaging, (payload) => {
      setLiveNotification({
        title: payload.data?.title,
        body: payload.data?.body,
      });

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setLiveNotification(null);
      }, 5000);
    });

    return token;
  } catch (error) {
    console.error("FCM Setup Error:", error);
    return null;
  }
};