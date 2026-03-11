import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify } from "../constants/config";
import { useEffect } from "react";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineX,
  HiOutlineShieldCheck,
} from "react-icons/hi";

const ForgotPasswordModal = ({ onClose }) => {
  
  const navigate = useNavigate();const [forgotEmail, setForgotEmail] = useState("");
const [otp, setOtp] = useState("");
const [step, setStep] = useState(1);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [isProcessing, setIsProcessing] = useState(false);
const [emailTimer, setEmailTimer] = useState(60);
const [emailResending, setEmailResending] = useState(false);
const handleSendOtp = async () => {
  if (!forgotEmail) {
    notify(false, "Enter email");
    return;
  }

  try {
    setIsProcessing(true);

    const res = await fetch(
      `${baseUrl}${import.meta.env.VITE_FORGOT_PASSWORD_API}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      notify(false, data.message);
      return;
    }

    notify(true, "OTP sent successfully");
    setStep(2);
    setEmailTimer(60);
  } catch {
    notify(false, "Server error");
  } finally {
    setIsProcessing(false);
  }
};
const handleUpdatePassword = async () => {
  if (!newPassword || !confirmPassword) {
    return notify(false, "Please enter password");
  }

  if (newPassword !== confirmPassword) {
    return notify(false, "Passwords do not match");
  }

  if (newPassword.length < 8) {
    return notify(false, "Password must be at least 8 characters");
  }

  try {
    setIsProcessing(true);

    const res = await fetch(
      `${baseUrl}${import.meta.env.VITE_UPDATE_PASSWORD_API}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          password: newPassword,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      notify(true, "Password updated successfully");
      onClose();
    } else {
      notify(false, data.message || "Password update failed");
    }
  } catch {
    notify(false, "Server error");
  } finally {
    setIsProcessing(false);
  }
};
const handleVerifyOtp = async () => {
  if (otp.length !== 6) {
    notify(false, "Enter 6 digit OTP");
    return;
  }

  const mode = "Email";
  const emailMobile = forgotEmail;

  try {
    setIsProcessing(true);

    const res = await fetch(
      `${baseUrl}${import.meta.env.VITE_VERIFY_OTP_API}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: mode,
          emailMobile: emailMobile,
          otp: otp,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      notify(true, "OTP verified successfully");
      setStep(3);
    } else {
      notify(false, data.message || "OTP verification failed");
    }
  } catch {
    notify(false, "Server error");
  } finally {
    setIsProcessing(false);
  }
};

useEffect(() => {
  if (step !== 2 || emailTimer === 0) return;

  const interval = setInterval(() => {
    setEmailTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [step, emailTimer]);
const handleResendOtp = async () => {
if (emailTimer > 0 || emailResending) return;
  try {
    setEmailResending(true);

    const res = await fetch(
      `${baseUrl}${import.meta.env.VITE_RESEND_OTP_API}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "Email",
          emailMobile: forgotEmail,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      notify(true, "OTP resent successfully");
      setEmailTimer(60);
    } else {
      notify(false, data.message || "Resend failed");
    }

  } catch {
    notify(false, "Server error");
  } finally {
    setEmailResending(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <HiOutlineShieldCheck />
            </div>
            <h2 className="font-semibold text-gray-800">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verification"}
              {step === 3 && "Security Update"}
            </h2>
          </div>

          <button onClick={onClose}>
            <HiOutlineX className="text-gray-400 text-xl hover:text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-8 py-8">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Reset Password
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email or phone number below. We'll send you a
                secure Otp to reset your account password.
              </p>

              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email or phone number
              </label>

              <div className="relative mb-6">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
  type="email"
  placeholder="name@example.com"
  value={forgotEmail}
  onChange={(e) => setForgotEmail(e.target.value)}
  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
/>
              </div>
<button
  onClick={handleSendOtp}
  disabled={isProcessing}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
>
  {isProcessing ? "Sending..." : "Submit →"}
</button>

              <p className="text-sm text-center text-gray-500 mt-6">
                Remember your password?{" "}
               <span
  onClick={() => {
    onClose();      
    navigate("/");  
  }}
  className="text-blue-600 font-medium cursor-pointer hover:underline"
>
  Back to Login
</span>
              </p>
            </>
          )}

          {/* STEP 2 OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineShieldCheck />
                </div>

                <h3 className="text-xl font-semibold mb-1">
                  Verification
                </h3>

                <p className="text-sm text-gray-500">
                  We've sent the code to your phone
                </p>
              </div>

             <div className="flex justify-center gap-3 mb-6">
  {[...Array(6)].map((_, index) => (
    <input
      key={index}
      type="text"
      maxLength="1"
      value={otp[index] || ""}
      onChange={(e) => {
        const value = e.target.value;

        // Only numbers allow
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = otp.split("");
        newOtp[index] = value;
        const updatedOtp = newOtp.join("");
        setOtp(updatedOtp);

        // Auto move to next box
        if (value && e.target.nextElementSibling) {
          e.target.nextElementSibling.focus();
        }
      }}
      onKeyDown={(e) => {
        if (
          e.key === "Backspace" &&
          !otp[index] &&
          e.target.previousElementSibling
        ) {
          e.target.previousElementSibling.focus();
        }
      }}
      className="w-12 h-12 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />
  ))}
</div>

              <p className="text-sm text-center text-gray-500 mb-6">
                Didn’t receive the code?{" "}
                <span
  onClick={handleResendOtp}
  className={`font-medium ${
    emailTimer > 0
      ? "text-gray-400 cursor-not-allowed"
      : "text-blue-600 cursor-pointer hover:underline"
  }`}
>
  {emailTimer > 0 ? `Resend in ${emailTimer}s` : "Resend OTP"}
</span>
              </p>

             <button
  onClick={handleVerifyOtp}
  disabled={isProcessing}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
>
  {isProcessing ? "Verifying..." : "Verify →"}
</button>
              <p className="text-[10px] text-center text-gray-400 mt-6 tracking-widest">
                SECURE 256-BIT ENCRYPTED VERIFICATION
              </p>
            </>
          )}

          {/* STEP 3 PASSWORD */}
          {step === 3 && (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Create New Password
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                Your new password must be different from your previous
                password to ensure your account security.
              </p>

              <label className="text-sm font-medium block mb-2">
                New Password
              </label>

              <div className="relative mb-4">
               <input
  type="password"
  placeholder="Enter at least 8 characters"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
/>
              </div>

              <label className="text-sm font-medium block mb-2">
                Confirm Password
              </label>

              <div className="relative mb-6">
               <input
  type="password"
  placeholder="Re-enter your new password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
/>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 mb-6">
                • At least 8 characters long <br />
                • Include a symbol or number
              </div>

             <button
  onClick={handleUpdatePassword}
  disabled={isProcessing}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition"
>
  {isProcessing ? "Updating..." : "Update Password →"}
</button>

              <p className="text-sm text-center text-gray-500 mt-6">
                Cancel and return to login
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;