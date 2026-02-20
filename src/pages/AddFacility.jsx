import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";

const AddFacility = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [workers, setWorkers] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchAllWorkers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SIGNUP_API}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();
      if (res.ok) {
        setWorkers(data.data || []);
      }
    } catch (err) {
      console.error("Fetch error");
    }
  };

  useEffect(() => {
    fetchAllWorkers();
  }, []);

  const handleSubmit = async () => {
    if (isRegistering) return;

    try {
      setIsRegistering(true);

      const res = await fetch(
        "http://192.168.0.76:3000/api/healthCareWorker/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            password: formData.password,
            roleId: 2,
            roleName: "Healthcare Facilities",
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, "Healthcare worker added successfully");
        navigate("/dashboard2", { replace: true });
      } else {
        notify(false, data.message || "Signup failed");
      }
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#4039AD] text-white flex flex-col justify-between">
        <div className="px-6 py-6">
          <img src="/logo.png" className="w-[160px]" />
        </div>
        <div className="px-6 py-6 text-yellow-300">Logout</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        <div className="grid grid-cols-2 gap-8">
          {/* LEFT FORM */}
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Add New Healthcare Facility
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Expand your network by registering a new clinical facility. This
              information will be used for contract management and staffing
              assignments.
            </p>

            <h3 className="text-xs font-semibold tracking-widest text-gray-400 mb-4 border-b pb-2">
              FACILITY ADMINISTRATOR
            </h3>

            {["fullName", "email", "mobileNumber", "password"].map((field) => (
              <div key={field} className="mb-5">
                <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                  {field === "fullName"
                    ? "Hospital Full Name"
                    : field === "mobileNumber"
                      ? "Mobile Number"
                      : field === "password"
                        ? "System Password"
                        : "Email Address"}
                </label>

                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  placeholder={
                    field === "fullName"
                      ? "e.g.Apollo Hospitals"
                      : field === "email"
                        ? "admin@facility.com"
                        : field === "mobileNumber"
                          ? "+9100000-00000"
                          : "Enter password"
                  }
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4039AD] focus:border-transparent transition"
                />
              </div>
            ))}

            {/* Terms */}
            <div className="flex items-start gap-2 mb-6">
              <input type="checkbox" className="mt-1" />
              <p className="text-sm text-gray-500">
                I confirm that I have the legal authority to register this
                facility and I agree to the{" "}
                <span className="text-[#4039AD] font-medium cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-[#4039AD] font-medium cursor-pointer">
                  Data Processing Agreement
                </span>
                .
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() =>
                  setFormData({
                    fullName: "",
                    email: "",
                    mobileNumber: "",
                    password: "",
                  })
                }
                className="px-6 py-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRegistering}
                className={`px-8 py-3 rounded-lg text-white font-medium shadow-md flex items-center justify-center gap-2 transition
    ${
      isRegistering
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#4039AD] hover:shadow-lg hover:opacity-95"
    }
  `}
              >
                {isRegistering && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {isRegistering ? "Registering..." : "Register Facility"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddFacility;
