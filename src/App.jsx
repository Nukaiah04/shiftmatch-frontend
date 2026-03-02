import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ToastContainer } from "react-toastify";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

import Login from "./Authentication.jsx/Login";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import AddFacility from "./pages/AddFacility";
import ResetPassword from "./pages/ResetPassword";

const App = () => {

  const [liveNotification, setLiveNotification] = useState(null);
  const audioRef = useRef(null);
  if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ SW registered:", registration);
    })
    .catch((err) => {
      console.log("❌ SW registration failed:", err);
    });
}

  useEffect(() => {

    let unsubscribe;

    // const setupFCM = async () => {
    //   try {
    //     console.log("Requesting permission...");

    //     const permission = await Notification.requestPermission();
    //     console.log("Permission:", permission);

    //     if (permission !== "granted") return;

    //     const registration = await navigator.serviceWorker.register(
    //       "/firebase-messaging-sw.js"
    //     );

    //     const token = await getToken(messaging, {
    //       vapidKey:
    //         "BKrmqPYRerzCt_4JEjQELdYK4-W0VFSVFvl9Tu-O7MkvW5hC7duEi5snp0DlOAquLirdyeo-b_AwOml_56yQK4s",
    //       serviceWorkerRegistration: registration,
    //     });

    //     console.log("FCM TOKEN:", token);

    //     // 🔥 FOREGROUND LISTENER
    //     unsubscribe = onMessage(messaging, (payload) => {
    //       console.log("🔥 FOREGROUND MESSAGE:", payload);

    //       setLiveNotification({
    //         title: payload.data?.title,
    //         body: payload.data?.body,
    //       });

    //       if (audioRef.current) {
    //         audioRef.current.currentTime = 0;
    //         audioRef.current.play().catch((err) => {
    //           console.log("Sound blocked:", err);
    //         });
    //       }

    //       // Auto close after 5 sec
    //       setTimeout(() => {
    //         setLiveNotification(null);
    //       }, 5000);
    //     });

    //   } catch (error) {
    //     console.error("FCM Setup Error:", error);
    //   }
    // };

    // setupFCM();

    return () => {
      if (unsubscribe) unsubscribe();
    };

  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/notification.mp3"
        preload="auto"
      />

      {liveNotification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-black text-white w-80 rounded-lg shadow-2xl p-4">

            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-sm">
                  {liveNotification.title}
                </h4>
                <p className="text-xs text-gray-300 mt-1">
                  {liveNotification.body}
                </p>
              </div>
              <button
                onClick={() => setLiveNotification(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-xs px-3 py-1 rounded">
              Check Now
            </button>

          </div>
        </div>
      )}

      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard2" element={<Dashboard2 />} />
          <Route path="/add-facility" element={<AddFacility />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;