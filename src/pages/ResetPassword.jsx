import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { baseUrl, notify } from "../constants/config";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      notify(false, "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      notify(false, "Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(
        `${baseUrl}/healthcareWorker/ResetPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Reset failed");
        return;
      }

      notify(true, "Password reset successful");
      navigate("/login");
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-8 rounded-xl shadow-xl">

        <h2 className="text-xl font-semibold mb-6">
          Set New Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded-md mb-4"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded-md mb-6"
        />

        <button
          onClick={handleReset}
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md text-white flex items-center justify-center gap-2
            ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4039AD]"
            }
          `}
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {isSubmitting ? "Saving..." : "Save & Submit"}
        </button>

      </div>
    </div>
  );
};

export default ResetPassword;