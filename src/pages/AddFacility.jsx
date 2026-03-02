import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../constants/config";
import { FaHospitalAlt, FaMobileAlt } from "react-icons/fa";
import { MdMarkEmailRead } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AddFacility = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);

  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [emailTimer, setEmailTimer] = useState(60);
  const [mobileTimer, setMobileTimer] = useState(60);

  const emailRefs = useRef([]);
  const mobileRefs = useRef([]);
  const [emailResending, setEmailResending] = useState(false);
const [mobileResending, setMobileResending] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ================= GENERATE OTP =================
  const handleSubmit = async () => {
    if (!isTermsAccepted) return notify(false, "Accept terms first");

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.mobileNumber ||
      !formData.password
    ) {
      return notify(false, "Fill all fields");
    }

    try {
      setIsRegistering(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_GENERATE_OTP_API}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            mobileNumber: formData.mobileNumber,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, "OTP sent successfully");
        setShowOtpModal(true);
        setEmailTimer(60);
        setMobileTimer(60);
      } else {
        notify(false, data.message || "OTP generation failed");
      }
    } catch {
      notify(false, "Server error");
    } finally {
      setIsRegistering(false);
    }
  };

  // ================= TIMER =================
  useEffect(() => {
    if (!showOtpModal) return;

    const interval = setInterval(() => {
      setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setMobileTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtpModal]);

  // ================= OTP CHANGE =================
  const handleOtpChange = (value, index, type) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated =
      type === "email" ? [...emailOtp] : [...mobileOtp];

    updated[index] = value;

    const refs = type === "email" ? emailRefs : mobileRefs;

    if (type === "email") setEmailOtp(updated);
    else setMobileOtp(updated);

    if (value && index < 5) refs.current[index + 1]?.focus();
    if (!value && index > 0) refs.current[index - 1]?.focus();
  };

  // ================= VERIFY =================
  const handleOtpVerify = async (type) => {
  const otp =
    type === "email"
      ? emailOtp.join("")
      : mobileOtp.join("");

  if (otp.length !== 6) {
    return notify(false, `Enter valid ${type} OTP`);
  }

  const mode = type === "email" ? "Email" : "Mobile";
  const emailMobile =
    type === "email"
      ? formData.email
      : formData.mobileNumber;

  try {
    if (type === "email") setEmailResending(true);
    else setMobileResending(true);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_VERIFY_OTP_API}`,
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
  notify(true, `${mode} verified successfully`);

  if (type === "email") {
    setEmailVerified(true);
    setEmailTimer(0); // 🔥 STOP EMAIL TIMER
  } else {
    setMobileVerified(true);
    setMobileTimer(0); //
  }
}

     else {
      notify(false, data.message || "OTP verification failed");
    }

  } catch {
    notify(false, "Server error");
  } finally {
    if (type === "email") setEmailResending(false);
    else setMobileResending(false);
  }
};

  // ================= RESEND =================
  const handleResendOtp = async (mode, emailMobile) => {
  try {
    if (mode === "Email") setEmailResending(true);
    else setMobileResending(true);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_RESEND_OTP_API}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: mode,
          emailMobile: emailMobile,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      notify(true, `${mode} OTP resent`);

      if (mode === "Email") {
        setEmailTimer(60);
      } else {
        setMobileTimer(60);
      }

    } else {
      notify(false, data.message || "Resend failed");
    }

  } catch {
    notify(false, "Server error");
  } finally {
    if (mode === "Email") setEmailResending(false);
    else setMobileResending(false);
  }
};

  // ================= FINAL SIGNUP =================
  const handleContinue = async () => {
    if (!emailVerified || !mobileVerified)
      return notify(false, "Verify both OTPs first");

    try {
      setIsRegistering(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SIGNUP_API}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            roleId: 2,
            roleName: "Healthcare Facilities",
            emailOtp: emailOtp.join(""),
            mobileOtp: mobileOtp.join(""),
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, "Facility registered successfully");
        setShowOtpModal(false);
        navigate("/dashboard2", { replace: true });
      } else {
        notify(false, data.message || "Signup failed");
      }
    } catch {
      notify(false, "Server error");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-[260px] bg-[#4039AD] text-white flex flex-col justify-between">
        <div className="px-6 py-6">
          <img src="/logo.png" className="w-[160px]" />
        </div>
        <div className="px-6 py-6 text-yellow-300 cursor-pointer">
          Logout
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
       <div className="bg-white w-full max-w-4xl rounded-2xl shadow-md p-8">
  <h1 className="text-2xl font-bold mb-6">
    Add New Healthcare Facility
  </h1>

  {["fullName", "email", "mobileNumber", "password"].map(
    (field) => {
      const Icon =
        field === "fullName"
          ? FaHospitalAlt
          : field === "mobileNumber"
          ? FaMobileAlt
          : field === "password"
          ? TbLockPassword
          : MdMarkEmailRead;

      return (
        <div key={field} className="mb-5">
          <label className="flex items-center gap-2 mb-1">
            <Icon className="text-[#4039AD]" />
            {field === "fullName"
              ? "Hospital Full Name"
              : field === "mobileNumber"
              ? "Mobile Number"
              : field === "password"
              ? "System Password"
              : "Email Address"}
          </label>

          {field === "mobileNumber" ? (
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // only digits
                if (value.length <= 10) {
                  setFormData({
                    ...formData,
                    mobileNumber: value,
                  });
                }
              }}
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full px-4 py-3 border rounded-lg"
            />
          ) : field === "password" ? (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          ) : (
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg"
            />
          )}
        </div>
      );
    }
  )}

  <div className="flex items-center gap-3 mt-6">
    <input
      type="checkbox"
      checked={isTermsAccepted}
      onChange={() =>
        setIsTermsAccepted(!isTermsAccepted)
      }
    />
    <p>I agree to Terms & Conditions</p>
  </div>

  <div className="flex justify-end mt-8">
    <button
      onClick={handleSubmit}
      disabled={isRegistering}
      className="px-8 py-3 bg-[#4039AD] text-white rounded-xl"
    >
      {isRegistering
        ? "Sending OTP..."
        : "Register Facility"}
    </button>
  </div>
</div>
      </main>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
<div className="bg-white w-[520px] p-8 rounded-3xl shadow-2xl relative">

  <button
    onClick={() => setShowOtpModal(false)}
    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
  >
    ✕
  </button>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 text-8xl">
                🔐
              </div>
              <h2 className="text-xl font-bold">
                Verify Your Email & Mobile
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Enter the 6 digit verification codes.
              </p>
            </div>

            {/* EMAIL OTP */}
            <div className="mb-8">
              <p className="font-medium mb-3">Email OTP</p>
              <div className="flex items-center gap-3">
                {emailOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (emailRefs.current[i] = el)}
                    maxLength="1"
                    value={digit}
                    disabled={emailVerified}
                    onChange={(e) =>
                      handleOtpChange(e.target.value, i, "email")
                    }
                    className="w-12 h-12 border rounded-lg text-center"
                  />
                ))}

                {!emailVerified ? (
                 <button
  onClick={() => handleOtpVerify("email")}
  disabled={emailVerified}
  className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
  {emailVerified ? "Verified" : "Verify"}
</button>
                ) : (
                  <span className="text-green-600 font-semibold">
                    Verified
                  </span>
                )}
              </div>

              {emailTimer > 0 ? (
                <p className="mt-2 text-sm">
                  Resend in {emailTimer}s
                </p>
              ) : (
               <button
  onClick={() =>
    handleResendOtp("Email", formData.email)
  }
  disabled={emailResending}
  className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition 
  ${
    emailResending
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-[#4039AD] text-white "
  }`}
>
  {emailResending ? "Sending..." : "Resend OTP"}
</button>
                
              )}
            </div>

            {/* MOBILE OTP */}
            <div className="mb-8">
              <p className="font-medium mb-3">Mobile OTP</p>
              <div className="flex items-center gap-3">
                {mobileOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (mobileRefs.current[i] = el)}
                    maxLength="1"
                    value={digit}
                    disabled={mobileVerified}
                    onChange={(e) =>
                      handleOtpChange(e.target.value, i, "mobile")
                    }
                    className="w-12 h-12 border rounded-lg text-center"
                  />
                ))}

                {!mobileVerified ? (
                  <button
  onClick={() => handleOtpVerify("mobile")}
  disabled={mobileVerified}
  className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
  {mobileVerified ? "Verified" : "Verify"}
</button>
                ) : (
                  <span className="text-green-600 font-semibold">
                    Verified
                  </span>
                )}
              </div>

              {mobileTimer > 0 ? (
                <p className="mt-2 text-sm">
                  Resend in {mobileTimer}s
                </p>
              ) : (
               <button
  onClick={() =>
    handleResendOtp("Mobile", formData.mobileNumber)
  }
  disabled={mobileResending}
  className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition 
  ${
    mobileResending
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-[#4039AD] text-white"
  }`}
>
  {mobileResending ? "Sending..." : "Resend OTP"}
</button>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!emailVerified || !mobileVerified}
              className={`w-full py-3 rounded-full font-semibold ${
                !emailVerified || !mobileVerified
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 text-white"
              }`}
            >
              Click Here To Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFacility;