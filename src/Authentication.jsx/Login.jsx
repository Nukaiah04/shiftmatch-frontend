import React, { useState } from "react";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";
import { setupFCM } from "../utils/fcm";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isLoggingIn) return;

    try {
      setIsLoggingIn(true);

      const response = await fetch(
        `${baseUrl}/${urls?.healthCareWorker?.login}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.status === 200 && data.token) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userId", data.data._id);
        sessionStorage.setItem("roleId", data.data.roleId);

       const fcmToken = await setupFCM();

if (fcmToken) {
  sessionStorage.setItem("fcmToken", fcmToken);

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
      notify(false, "Server error");
    } finally {
      setIsLoggingIn(false);
    }
  };

 

  

  

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#4A42B8] flex flex-col items-center justify-center text-white py-10 md:h-screen">
        {/* Logo */}
  <div className="w-full flex flex-col items-center text-white pt-2 pb-10">
  <img
    src="/logo.png"
    alt="ShiftMatch Logo"
    className="w-[220px] md:w-[420px] object-contain mt-2"
  />

  <div className="flex flex-col items-center -mt-16 md:-mt-20">
    <div className="w-56 h-[2px] bg-white opacity-80 mb-4"></div>

   <p className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
  You’re in safe hands
</p>
  </div>
</div>
      </div>

     <div className="w-full md:w-1/2 bg-white flex items-center justify-center py-10 md:py-0"> 
<div className="w-[90%] md:w-[420px]">

    <h2 className="text-3xl font-semibold text-gray-900 mb-2">
      Welcome Back
    </h2>

    <p className="text-gray-500 mb-8">
      To keep connected with us login with your personal info
    </p>

    {/* Email */}
    <div className="mb-5 relative">
      <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
      <input
        type="email"
        placeholder="Mobile Number"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4039AD]"
      />
    </div>

    {/* Password */}
    <div className="mb-5 relative">
      <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4039AD]"
      />
    </div>

    <div className="flex items-center justify-between text-sm mb-8">
      <label className="flex items-center gap-2 text-gray-600">
        <input type="checkbox" className="accent-[#4039AD]" />
        Remember me?
      </label>

      <button
        onClick={() => setShowForgotModal(true)}
        className="text-[#4039AD] hover:underline font-medium"
      >
        Forgot Password?
      </button>
    </div>

    {/* Button */}
    <button
      onClick={handleLogin}
      disabled={isLoggingIn}
      className="w-full py-3 rounded-lg font-semibold text-white bg-[#4039AD] hover:opacity-90 transition"
    >
      {isLoggingIn ? "Signing in..." : "Sign in"}
    </button>

  </div>
</div>

     {showForgotModal && (
  <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
)}
    </div>
  );
};

export default Login;