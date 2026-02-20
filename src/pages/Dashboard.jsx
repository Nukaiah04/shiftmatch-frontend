import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";
import { FaEdit } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("documents");

  const [documents, setDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [docTab, setDocTab] = useState("types");

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [selectedShiftPayRate, setSelectedShiftPayRate] = useState(0);

  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [title, setTitle] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requiredStaff, setRequiredStaff] = useState("");
  const [pay, setPay] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [duties, setDuties] = useState("");
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptStatus, setNewDeptStatus] = useState(true);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [applicantsData, setApplicantsData] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const [editProfileData, setEditProfileData] = useState({
    fullName: "",
    email: "",
    roleName: "",
    state: "",
    city: "",
    area: "",
    street: "",
    pincode: "",
    country: "",
  });

  const handlePunchTime = async (applicationId, type) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SHIFT_PUNCH_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: applicationId,
            type: type, // PunchIn or PunchOut
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Punch failed");
        return;
      }

      const message =
        type === "PunchIn"
          ? "Start time recorded successfully"
          : "End time recorded successfully";

      notify(true, message);

      // 🔥 refresh applicants list
      fetchShiftApplications(data.data.shiftId);
    } catch (err) {
      notify(false, "Server error");
    }
  };

  const handleOpenEditModal = async () => {
    await fetchStates();
    await fetchCities();

    setEditProfileData({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      roleName: currentUser?.roleName || "",

      state: currentUser?.addressData?.stateId || "",
      city: currentUser?.addressData?.cityId || "",

      area: currentUser?.addressData?.addressLine1 || "",
      street: currentUser?.addressData?.addressLine2 || "",
      pincode: currentUser?.addressData?.postalCode || "",
      country: currentUser?.addressData?.country || "",
    });

    setShowEditProfileModal(true);
  };

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const handleViewApplicants = (applications = []) => {
    setSelectedApplicants(applications);
    setShowApplicantsModal(true);
  };

  const fetchShiftApplications = async (shiftId) => {
    try {
      setLoadingApplicants(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SHIFT_APPLICATION_BY_ID_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            shiftId: shiftId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Failed to fetch applicants");
        return;
      }

      setApplicantsData(data.data || []);
      setShowApplicantsModal(true);
    } catch (err) {
      console.error(err);
      notify(false, "Server error");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      alert("Department name required");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DEPARTMENT_CREATE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            departmentName: newDeptName,
            isActive: newDeptStatus,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create department");
        return;
      }

      notify(true, "Department created successfully ");

      setShowCreateDept(false);
      setNewDeptName("");
      setNewDeptStatus(true);

      fetchDepartments();
    } catch (err) {
      console.error("Create department error", err);
      alert("Server error");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_GET_CURRENT_USER_API}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.data) && data.data.length > 0) {
        const user = data.data[0];
        setCurrentUser(user);

        const cityName =
          user.addressData?.city?.name || user.addressData?.city || "";

        const cityId =
          user.addressData?.cityId?._id ||
          user.addressData?.cityId ||
          user.addressData?.city?._id ||
          "";

        setLocation(cityName);
        setLocationId(cityId);

        console.log("CITY NAME ", cityName);
        console.log("CITY ID ", cityId);
      }
    } catch (err) {
      console.error("Fetch current user error:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    if (currentUser?.addressData) {
      const fullAddress = [currentUser.addressData.city]
        .filter(Boolean)
        .join(", ");

      setLocation(fullAddress);
    }
  }, [currentUser]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "--";

  const getVerificationBadge = (status) => {
    if (status === "Verified") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_DEPARTMENT_API}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        },
      );

      const data = await res.json();
      console.log("DEPARTMENTS API 👉", data);

      if (res.ok) {
        setDepartments(data.data || []);
      }
    } catch (err) {
      console.error("Department fetch failed", err);
    }
  };

  const handleCreateShift = async () => {
    if (isCreatingShift) return; // 🛑 Prevent double click

    if (
      !title ||
      !selectedDepartmentId ||
      !selectedDepartment ||
      !shiftDate ||
      !startTime ||
      !endTime ||
      !requiredStaff ||
      !pay ||
      !location
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsCreatingShift(true);

      const payload = {
        title,
        departmentId: selectedDepartmentId,
        departmentName: selectedDepartment,
        shiftDate,
        startTime,
        endTime,
        requiredStaff: Number(requiredStaff),
        payRate: Number(pay),
        location,
        locationId,
        duties,
        hospitalId: sessionStorage.getItem("userId"),
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_SHIFT_CREATE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Validation failed");
        return;
      }

      notify(true, "Shift created successfully");

      // clear form
      setTitle("");
      setSelectedDepartment("");
      setSelectedDepartmentId("");
      setShiftDate("");
      setStartTime("");
      setEndTime("");
      setRequiredStaff("");
      setPay("");
      setDuties("");
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setIsCreatingShift(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editProfileData.state || !editProfileData.city) {
        notify(false, "Please select state and city");
        return;
      }

      const selectedState = statesList.find(
        (s) => s._id === editProfileData.state,
      );

      const selectedCity = citiesList.find(
        (c) => c._id === editProfileData.city,
      );

      const bodyData = {
        sId: currentUser?.addressData?._id || "",
        userId: currentUser?._id,

        stateId: editProfileData.state,
        state: selectedState?.name || "",

        cityId: editProfileData.city,
        city: selectedCity?.name || "",

        addressLine1: editProfileData.area,
        addressLine2: editProfileData.street,
        postalCode: editProfileData.pincode,
        country: editProfileData.country,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ADDRESS_INSERT_UPDATE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(bodyData),
        },
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, "Address updated successfully ");
        setShowEditProfileModal(false);
        fetchCurrentUser();
      } else {
        notify(false, data.message || "Update failed");
      }
    } catch (err) {
      console.error("Address update error:", err);
      notify(false, "Something went wrong");
    }
  };
  const fetchStates = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LOCATION_GET_ALL_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ type: 1 }),
        },
      );

      const data = await res.json();
      if (res.ok) setStatesList(data.data || []);
    } catch (err) {
      console.error("Fetch states error", err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LOCATION_GET_ALL_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ type: 2 }),
        },
      );

      const data = await res.json();
      if (res.ok) setCitiesList(data.data || []);
    } catch (err) {
      console.error("Fetch cities error", err);
    }
  };

  const fetchAllShifts = async () => {
    try {
      setLoadingShifts(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SHIFT_GET_ALL_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: sessionStorage.getItem("userId"),
          }),
        },
      );

      const data = await res.json();
      console.log("GET SHIFTS RESPONSE", data);

      if (!res.ok) {
        alert(data.message || "Failed to fetch shifts");
        return;
      }

      setShifts(data.data || []);
    } catch (err) {
      console.error("Get shifts error ❌", err);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_TYPE_GET_ALL_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            referTo: 1,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to fetch documents");
        return;
      }

      setDocuments(data.data || []);
    } catch (err) {
      console.error("Fetch documents error", err);
    }
  };

  const fetchUploadedDocuments = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_GET_ALL_API}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: userId }),
      },
    );
    const data = await res.json();
    if (res.ok) setUploadedDocuments(data.data || []);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (docTab === "uploaded") fetchUploadedDocuments();
  }, [docTab]);

  const handleUploadClick = () => {
    if (!selectedDocument) return alert("Select document first");
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setIssuedBy("");
    setIssueDate("");
    setExpiryDate("");
    setSelectedFile(null);
  };

  const handleSubmitDocument = async () => {
    if (!selectedDocument || !selectedFile) return alert("Missing fields");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentTypeId", selectedDocument._id);
    formData.append("documentName", selectedDocument.name);
    formData.append("issuedBy", issuedBy);
    formData.append("issueDate", issueDate);
    formData.append("expiryDate", expiryDate);
    formData.append("hospitalId", sessionStorage.getItem("userId"));

    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_UPLOAD_API}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: formData,
      },
    );

    fetchUploadedDocuments();
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <aside className="w-[240px] bg-[#4039AD] text-white flex flex-col justify-between h-screen fixed left-0 top-0">
        <div>
          <div className="p-6">
            <img src="/logo.png" className="w-50 h-50" />
          </div>

          <nav className="mt-6 text-sm">
            <div
              onClick={() => {
                setActivePage("dashboard");
                fetchAllShifts();
              }}
              className={`px-6 py-3 cursor-pointer ${
                activePage === "dashboard" ? "bg-white/10" : "opacity-80"
              }`}
            >
              Dashboard
            </div>

            <div
              onClick={() => setActivePage("shifts")}
              className={`px-6 py-3 cursor-pointer ${
                activePage === "shifts" ? "bg-white/10" : "opacity-80"
              }`}
            >
              Manage Shifts
            </div>

            <div
              onClick={() => setActivePage("documents")}
              className={`px-6 py-3 cursor-pointer ${
                activePage === "documents" ? "bg-white/10" : "opacity-80"
              }`}
            >
              Documents
            </div>
          </nav>
        </div>

        {currentUser && (
          <div className="mx-4 mb-6 bg-white/10 rounded-lg p-4 text-xs">
            <div className="font-semibold text-white truncate">
              {currentUser.fullName}
            </div>

            <div className="text-yellow-300 mt-1">{currentUser.roleName}</div>

            {/* ACTION ROW */}
            <div className="flex items-center justify-between mt-4">
              {/* EDIT BUTTON */}
              <button
                onClick={handleOpenEditModal}
                className="flex items-center gap-1 text-yellow-300"
              >
                <FaEdit />
                <span>Edit</span>
              </button>

              {/* LOGOUT */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1 text-yellow-300 hover:underline"
              >
                <MdLogout className="text-sm" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center">
              <div className="flex items-center justify-center">
                <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <MdLogout className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Are you want to logout?
              </h2>

              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                You'll need to log back in to manage your shifts and view new
                opportunities. We'll be here when you're ready.
              </p>

              {/* BUTTONS */}
              <div className="space-y-4">
                {/* PRIMARY BUTTON */}
                <button
                  onClick={() => {
                    sessionStorage.clear();
                    notify(false, "Logged out successfully");
                    setShowLogoutModal(false);

                    setTimeout(() => {
                      navigate("/login");
                    }, 800);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  Log Out →
                </button>

                {/* SECONDARY BUTTON */}
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full border border-gray-300 text-blue-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 ml-[240px] p-8 overflow-y-auto h-screen">
        {activePage === "dashboard" && (
          <>
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Dashboard – Posted Shifts
              </h2>
              <button
                onClick={() => setActivePage("shifts")}
                className="bg-[#4039AD] text-white px-5 py-2 rounded-lg"
              >
                + Post New Shift
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {loadingShifts ? (
                <p className="text-sm text-gray-500">Loading shifts...</p>
              ) : shifts.length === 0 ? (
                <p className="text-sm text-gray-500">No shifts posted yet</p>
              ) : (
                shifts.map((shift) => (
                  <div
                    key={shift._id}
                    className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition"
                  >
                    {/* TOP ROW */}
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>
                        ⏰ {shift.startTime} - {shift.endTime}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        Created Date: 🗓{" "}
                        {new Date(shift.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        •{" "}
                        {new Date(shift.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <span>📍 {shift.location}</span>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex gap-4">
                      {/* DATE BOX */}
                      <div className="w-[60px] rounded-md overflow-hidden text-center shadow-sm">
                        <div className="bg-[#4039AD] text-white text-xl font-bold py-2">
                          {new Date(shift.shiftDate).getDate()}
                        </div>
                        <div className="bg-[#4039AD]   text-white text-xs font-semibold py-1">
                          {new Date(shift.shiftDate).toLocaleString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="bg-yellow-400 text-black text-xs font-semibold py-1">
                          {new Date(shift.shiftDate).getFullYear()}
                        </div>
                      </div>

                      {/* RIGHT DETAILS */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{shift.title}</h4>

                        <p className="text-xs text-gray-500 mt-1">
                          {shift.departmentName}
                        </p>

                        {/* DUTIES */}
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          <span className="font-medium">Duties:</span>{" "}
                          {shift.duties}
                        </p>

                        {/* DETAILS ROW */}
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Pay</p>
                            <p className="font-semibold">₹ {shift.payRate}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs">
                              Required Staff
                            </p>
                            <p className="font-semibold">
                              {shift.requiredStaff}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs">Applicants</p>

                            <div className="flex items-center gap-1 mt-1">
                              {shift.applications?.slice(0, 3).map((app) => (
                                <div
                                  key={app._id}
                                  className="w-7 h-7 rounded-full bg-[#4039AD] text-white text-xs flex items-center justify-center font-semibold"
                                  title={app.worker[0]?.fullName}
                                >
                                  {app.worker[0]?.fullName?.charAt(0)}
                                </div>
                              ))}

                              {shift.applications?.length > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedShiftPayRate(shift.payRate);
                                    fetchShiftApplications(shift._id);
                                  }}
                                  className="ml-2 text-xs text-[#4039AD] underline"
                                >
                                  View Applicants
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex justify-between items-center mt-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          shift.status === "Open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {shift.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activePage === "shifts" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">Post New Shift</h3>
              <div className="relative mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeptDropdown(!showDeptDropdown);
                    if (departments.length === 0) fetchDepartments();
                  }}
                  className="border p-2 w-full text-left rounded bg-white flex justify-between items-center"
                >
                  <span>{selectedDepartment || "Select Department"}</span>

                  <span
                    className={`transform transition-transform duration-200 ${
                      showDeptDropdown ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {showDeptDropdown && (
                  <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-48 overflow-y-auto">
                    {departments.map((dept) => (
                      <div
                        key={dept._id}
                        onClick={() => {
                          setSelectedDepartment(dept.departmentName);
                          setSelectedDepartmentId(dept._id);
                          setShowDeptDropdown(false);
                        }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                      >
                        {dept.departmentName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                className="border p-2 w-full mb-3"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="date"
                className="border p-2 w-full mb-3"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="time"
                  className="border p-2 w-full"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                  type="time"
                  className="border p-2 w-full"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <input
                className="border p-2 w-full mb-3"
                placeholder="Required Staff"
                value={requiredStaff}
                onChange={(e) => setRequiredStaff(e.target.value)}
              />

              <input
                className="border p-2 w-full mb-3"
                placeholder="Pay"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
              />

              <input
                className="border p-2 w-full mb-3 bg-gray-100 cursor-not-allowed"
                placeholder="Location"
                value={location}
                readOnly
              />

              <input
                className="border p-2 w-full mb-3"
                placeholder="Enter Duties"
                value={duties}
                onChange={(e) => setDuties(e.target.value)}
              />

              <div className="flex gap-4">
                <button
                  className="border px-6 py-2 rounded"
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                  }}
                >
                  Clear
                </button>

                <button
                  onClick={handleCreateShift}
                  disabled={isCreatingShift}
                  className={`px-6 py-2 rounded text-white flex items-center justify-center gap-2
    ${isCreatingShift ? "bg-gray-400 cursor-not-allowed" : "bg-[#4039AD] hover:opacity-90"}
  `}
                >
                  {isCreatingShift && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {isCreatingShift ? "Posting..." : "Post Now"}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">Recent Posted</h3>

              {shifts.slice(0, 2).map((shift) => (
                <div
                  key={shift._id}
                  className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition"
                >
                  {/* TOP ROW */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>
                      ⏰ {shift.startTime} - {shift.endTime}
                    </span>
                    <span>📍 {shift.location}</span>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="flex gap-4">
                    {/* DATE BOX */}
                    <div className="w-[60px] rounded-md overflow-hidden text-center shadow-sm">
                      <div className="bg-[#4039AD] text-white text-xl font-bold py-2">
                        {new Date(shift.shiftDate).getDate()}
                      </div>
                      <div className="bg-[#4039AD]   text-white text-xs font-semibold py-1">
                        {new Date(shift.shiftDate).toLocaleString("en-US", {
                          month: "short",
                        })}
                      </div>
                      <div className="bg-yellow-400 text-black text-xs font-semibold py-1">
                        {new Date(shift.shiftDate).getFullYear()}
                      </div>
                    </div>

                    {/* RIGHT DETAILS */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{shift.title}</h4>

                      <p className="text-xs text-gray-500 mt-1">
                        {shift.departmentName}
                      </p>

                      {/* DUTIES */}
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        <span className="font-medium">Duties:</span>{" "}
                        {shift.duties}
                      </p>

                      {/* DETAILS ROW */}
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Pay</p>
                          <p className="font-semibold">₹ {shift.payRate}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs">
                            Required Staff
                          </p>
                          <p className="font-semibold">{shift.requiredStaff}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-xs">Applicants</p>

                          <div className="flex items-center gap-1 mt-1">
                            {shift.applications?.slice(0, 3).map((app) => (
                              <div
                                key={app._id}
                                className="w-7 h-7 rounded-full bg-[#4039AD] text-white text-xs flex items-center justify-center font-semibold"
                                title={app.worker[0]?.fullName}
                              >
                                {app.worker[0]?.fullName?.charAt(0)}
                              </div>
                            ))}

                            {shift.applications?.length > 0 && (
                              <button
                                onClick={() =>
                                  fetchShiftApplications(shift._id)
                                }
                                className="ml-2 text-xs text-[#4039AD] underline"
                              >
                                View Applicants
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex justify-between items-center mt-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        shift.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {shift.status || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "documents" && (
          <div className="grid grid-cols-12 gap-6 h-[75vh] overflow-hidden">
            {/* ================= LEFT PANEL ================= */}
            <div className="col-span-7 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
              {/* TABS (FIXED) */}
              <div className="flex gap-6 p-6 border-b text-sm font-medium shrink-0">
                <button
                  onClick={() => setDocTab("types")}
                  className={`pb-2 ${
                    docTab === "types"
                      ? "border-b-2 border-[#4039AD] text-[#4039AD]"
                      : "text-gray-500"
                  }`}
                >
                  My Documents
                </button>

                <button
                  onClick={() => setDocTab("uploaded")}
                  className={`pb-2 ${
                    docTab === "uploaded"
                      ? "border-b-2 border-[#4039AD] text-[#4039AD]"
                      : "text-gray-500"
                  }`}
                >
                  Uploaded Documents
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* ================= MY DOCUMENTS ================= */}
                {docTab === "types" && (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className={`grid grid-cols-12 items-center border rounded-lg px-4 py-3 text-sm ${
                          selectedDocument?._id === doc._id
                            ? "border-[#4039AD]"
                            : ""
                        }`}
                      >
                        <div className="col-span-6 font-medium">
                          {doc.name || doc.documentName}
                        </div>

                        <div className="col-span-3">
                          <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                            To be verified
                          </span>
                        </div>

                        <div className="col-span-2">
                          <button
                            onClick={handleUploadClick}
                            className="bg-green-500 text-white px-4 py-1.5 rounded-md text-xs"
                          >
                            Upload
                          </button>
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => handleSelectDocument(doc)}
                            className="text-[#4039AD] text-lg"
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ================= UPLOADED DOCUMENTS ================= */}
                {docTab === "uploaded" && (
                  <div className="space-y-3">
                    {/* HEADER ROW */}
                    <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                      <div className="col-span-4">Document Name</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-3">Expiry Date</div>
                      <div className="col-span-3 text-right">
                        Verification Status
                      </div>
                    </div>

                    {uploadedDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="grid grid-cols-12 items-center border rounded-lg px-4 py-3 text-sm"
                      >
                        <div className="col-span-4 font-medium">
                          {doc.documentName}
                        </div>

                        <div className="col-span-2">
                          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Submitted
                          </span>
                        </div>

                        <div className="col-span-3 text-gray-600">
                          {formatDate(doc.expiryDate)}
                        </div>

                        <div className="col-span-3 text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${getVerificationBadge(
                              doc.verificationStatus,
                            )}`}
                          >
                            {doc.verificationStatus || "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ================= RIGHT PANEL ================= */}
            <div className="col-span-5 h-full">
              {selectedDocument ? (
                <div className="bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between mb-5">
                      <h3 className="font-semibold text-sm">
                        {selectedDocument.name || selectedDocument.documentName}
                      </h3>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        To be verified
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">ISSUED BY</p>
                      <input
                        value={issuedBy}
                        onChange={(e) => setIssuedBy(e.target.value)}
                        className="w-full border px-3 py-2 rounded-md text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="border px-3 py-2 rounded-md text-sm"
                      />
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="border px-3 py-2 rounded-md text-sm"
                      />
                    </div>

                    <div
                      onClick={handleUploadClick}
                      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
                    >
                      {selectedFile
                        ? selectedFile.name
                        : "Drag and drop or browse"}
                    </div>

                    <button
                      onClick={handleSubmitDocument}
                      className="w-full mt-5 bg-[#4039AD] text-white py-2.5 rounded-lg text-sm"
                    >
                      Submit Document
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                  Select a document to view details
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        {showApplicantsModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[1100px] p-6">
              <h3 className="text-xl font-semibold mb-6">Shift Applicants</h3>

              {loadingApplicants ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : applicantsData.length === 0 ? (
                <p className="text-gray-500 text-sm">No applicants found</p>
              ) : (
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-gray-600 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 text-left">Applicant</th>
                        <th className="px-6 py-4 text-left">Start Time</th>
                        <th className="px-6 py-4 text-left">End Time</th>
                        <th className="px-6 py-4 text-left">Duration</th>
                        <th className="px-6 py-4 text-left">Pay Rate</th>
                        <th className="px-6 py-4 text-left">Total</th>
                        <th className="px-6 py-4 text-left">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {applicantsData.map((app) => {
                        const hasStarted = !!app.startTime;
                        const hasEnded = !!app.endTime;

                        let durationMinutes = 0;
                        let totalAmount = 0;

                        if (hasStarted && hasEnded) {
                          const start = new Date(app.startTime);
                          const end = new Date(app.endTime);

                          durationMinutes = Math.floor(
                            (end - start) / (1000 * 60),
                          );
                          const durationHours = durationMinutes / 60;

                          const payPerMinute = selectedShiftPayRate / 60;
                          totalAmount = durationMinutes * payPerMinute;
                        }

                        return (
                          <tr
                            key={app._id}
                            className="hover:bg-gray-50 transition"
                          >
                            {/* Applicant */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                  {app.userData?.imageUrl ? (
                                    <img
                                      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${app.userData.imageUrl}`}
                                      alt={app.userData.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-semibold text-gray-600">
                                      {app.userData?.fullName
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>

                                <p className="font-semibold text-gray-800">
                                  {app.userData?.fullName}
                                </p>
                              </div>
                            </td>

                            {/* Start Time */}
                            <td className="px-6 py-4">
                              {hasStarted ? (
                                new Date(app.startTime).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              ) : (
                                <button
                                  onClick={() =>
                                    handlePunchTime(app._id, "PunchIn")
                                  }
                                  className="px-3 py-1 rounded text-xs text-white bg-green-500 hover:bg-green-600"
                                >
                                  Start
                                </button>
                              )}
                            </td>

                            {/* End Time */}
                            <td className="px-6 py-4">
                              {hasEnded ? (
                                new Date(app.endTime).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              ) : (
                                <button
                                  disabled={!hasStarted}
                                  onClick={() =>
                                    handlePunchTime(app._id, "PunchOut")
                                  }
                                  className={`px-3 py-1 rounded text-xs text-white ${
                                    !hasStarted
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-red-500 hover:bg-red-600"
                                  }`}
                                >
                                  End
                                </button>
                              )}
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-4">
                              <td className="px-6 py-4">
                                {hasStarted && hasEnded
                                  ? `${(durationMinutes / 60).toFixed(3)} hrs`
                                  : "--"}
                              </td>
                            </td>

                            {/* Pay Rate */}
                            <td className="px-6 py-4">
                              ₹ {selectedShiftPayRate}
                            </td>

                            {/* Total */}
                            <td className="px-6 py-4 font-semibold">
                              {hasStarted && hasEnded
                                ? `₹ ${totalAmount.toFixed(2)}`
                                : "₹ --"}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  app.status === "Accepted"
                                    ? "bg-green-100 text-green-700"
                                    : app.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="text-right mt-6">
                <button
                  onClick={() => setShowApplicantsModal(false)}
                  className="px-6 py-2 bg-gray-200 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-[750px] max-h-[90vh] overflow-y-auto">
              {/* HEADER PROFILE SECTION */}
              <div className="flex items-center gap-4 p-6 border-b">
                <img
                  src={
                    currentUser?.imageUrl
                      ? `http://192.168.0.129:3000/uploads/${currentUser.imageUrl}`
                      : "https://i.pravatar.cc/100"
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-[#4039AD]"
                />

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editProfileData.fullName}
                  </h2>

                  <p className="text-sm text-[#4039AD] font-medium">
                    {editProfileData.roleName}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {editProfileData.email}
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="p-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-6">
                  Address Information
                </h3>

                {/* GRID 2 COLUMN */}
                <div className="grid grid-cols-2 gap-6">
                  {/* STATE */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      State
                    </label>
                    <select
                      value={editProfileData.state}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          state: e.target.value,
                        })
                      }
                      className="border w-full px-3 py-2 rounded-lg"
                    >
                      <option value="">Select State</option>
                      {statesList.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CITY */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      City
                    </label>
                    <select
                      value={editProfileData.city}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          city: e.target.value,
                        })
                      }
                      className="border w-full px-3 py-2 rounded-lg"
                    >
                      <option value="">Select City</option>
                      {citiesList
                        .filter(
                          (city) =>
                            city.parentId === editProfileData.state ||
                            city.parentId?._id === editProfileData.state,
                        )
                        .map((city) => (
                          <option key={city._id} value={city._id}>
                            {city.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* ADDRESS LINE 1 */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Street Address Line 1
                    </label>
                    <input
                      type="text"
                      value={editProfileData.area}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          area: e.target.value,
                        })
                      }
                      className="border w-full px-3 py-2 rounded-lg"
                    />
                  </div>

                  {/* ADDRESS LINE 2 */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Street Address Line 2
                    </label>
                    <input
                      type="text"
                      value={editProfileData.street}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          street: e.target.value,
                        })
                      }
                      className="border w-full px-3 py-2 rounded-lg"
                    />
                  </div>

                  {/* ZIP CODE */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={editProfileData.pincode}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          pincode: e.target.value,
                        })
                      }
                      className="border w-full px-3 py-2 rounded-lg"
                    />
                  </div>

                  {/* COUNTRY */}
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editProfileData.country}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          country: e.target.value,
                        })
                      }
                      className="border w-full px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end gap-4 mt-10 border-t pt-6">
                  <button
                    onClick={() => setShowEditProfileModal(false)}
                    className="px-6 py-2 border rounded-lg text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-[#4039AD] text-white rounded-lg text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
