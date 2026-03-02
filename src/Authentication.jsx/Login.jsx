import React, { useState } from "react";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";
import { setupFCM } from "../utils/fcm";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [isSendingLink, setIsSendingLink] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isLoggingIn) return;

    try {
      setIsLoggingIn(true);

      const response = await fetch(
        `${baseUrl}/${urls?.healthCareWorker?.login}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.status === 200 && data.token) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userId", data.data._id);
        sessionStorage.setItem("roleId", data.data.roleId);

        // 🔥 Generate FCM AFTER LOGIN
        const fcmToken = await setupFCM();

        if (fcmToken) {
          sessionStorage.setItem("fcmToken", fcmToken);

          const userRes = await fetch(
            `${baseUrl}${import.meta.env.VITE_HEALTHCARE_WORKER_GET_CURRENT_USER_API}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }
          );

          const userData = await userRes.json();

          if (userRes.ok && userData?.data?.length > 0) {
            const currentUser = userData.data[0];
            const existingFcmList = currentUser.fcm || [];

            const tokenExists = existingFcmList.includes(fcmToken);

            if (!tokenExists) {
              await fetch(
                `${baseUrl}${import.meta.env.VITE_HEALTHCARE_WORKER_UPDATE_FCM_API}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${data.token}`,
                  },
                  body: JSON.stringify({
                    fcm: fcmToken,
                    type: "Login",
                  }),
                }
              );

              console.log("✅ FCM token added to DB");
            }
          }
        }

        notify(true, data.message);

        if (data.data.roleId === 1) {
          navigate("/dashboard2");
        } else {
          navigate("/dashboard");
        }
      } else {
        notify(false, data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      notify(false, "Server error");
    } finally {
      setIsLoggingIn(false);
    }
  };
const handleForgotPassword = async () => {
  if (!forgotEmail) {
    notify(false, "Please enter email");
    return;
  }

  try {
    setIsSendingLink(true);

   const res = await fetch(
  `${baseUrl}${import.meta.env.VITE_FORGOT_PASSWORD_API}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: forgotEmail }),
  }
);

    const data = await res.json();

    if (!res.ok) {
      notify(false, data.message || "Failed to send link");
      return;
    }

    notify(true, "Reset link sent to your email");
    setShowForgotModal(false);
    setForgotEmail("");
  } catch (err) {
    notify(false, "Server error");
  } finally {
    setIsSendingLink(false);
  }
};
  return (
    <div className="min-h-screen flex">
      
      {/* LEFT PANEL */}
     <div className="w-1/2 h-screen bg-[#4A42B8] flex flex-col items-center justify-center text-white gap-10 py-10">
        {/* Logo */}
        <div className="w-1/2 h-screen bg-[#4A42B8] flex flex-col items-center text-white pt-10 pb-10">
          <img
            src="/logo.png"
            alt="ShiftMatch Logo"
            className="w-[420px] object-contain mt-8"
          />

          <div className="flex flex-col items-center -mt-16">
            <div className="w-56 h-[2px] bg-white opacity-80 mb-4"></div>
            <p className="text-2xl font-light tracking-wide">
              HealthCare Facilities
            </p>
          </div>
        </div>
      </div>
      {/* RIGHT PANEL */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-[380px]">

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome Back
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            To keep connected with us login with your personal info
          </p>

          {/* Email */}
          <div className="mb-4 relative">
            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]"
            />
          </div>

          {/* Password */}
          <div className="mb-3 relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]"
            />
          </div>

          {/* Remember & Recover */}
          <div className="flex items-center justify-between text-sm mb-5">
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" className="accent-[#4039AD]" />
              Remember me?
            </label>
            <button
  type="button"
  onClick={() => setShowForgotModal(true)}
  className="text-[#4039AD] hover:underline"
>
  Forgot Password
</button>
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full py-2.5 rounded-md font-medium transition flex items-center justify-center gap-2
              ${
                isLoggingIn
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#4039AD] text-white hover:opacity-90"
              }
            `}
          >
            {isLoggingIn && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </button>

        </div>
      </div>
      {showForgotModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[400px] p-6 rounded-xl shadow-xl">

      <h3 className="text-lg font-semibold mb-4">
        Reset Password
      </h3>

      <input
        type="email"
        placeholder="Enter your email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        className="w-full border px-4 py-2 rounded-md mb-4"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowForgotModal(false)}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleForgotPassword}
          disabled={isSendingLink}
          className={`px-4 py-2 rounded-md text-white flex items-center gap-2
            ${
              isSendingLink
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4039AD]"
            }
          `}
        >
          {isSendingLink && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {isSendingLink ? "Sending..." : "Send Link"}
        </button>
      </div>

    </div>
  </div>
)}
    </div>
    
    
  );
};

export default Login;