import React, { useState } from "react";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  const navigate = useNavigate();

 const handleLogin = async () => {
  if (isLoggingIn) return;

  const startTime = Date.now();

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

      notify(data?.status, data?.message);

      const elapsed = Date.now() - startTime;
      const minimumTime = 1000;

      if (elapsed < minimumTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minimumTime - elapsed)
        );
      }

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

          <div className="flex items-center justify-between text-sm mb-5">
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" className="accent-[#4039AD]" />
              Remember me?
            </label>
            <button className="text-[#4039AD] hover:underline">
              Recover Password
            </button>
          </div>

          {/* Button */}
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
    </div>
  );
};

export default Login;
