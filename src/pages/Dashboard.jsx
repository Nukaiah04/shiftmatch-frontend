import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl, notify, urls } from "../constants/config";
import { FaEdit } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import { LuUpload } from "react-icons/lu";
import { LuEye } from "react-icons/lu";
import { getStatusColor } from "../utils/statusColors";
import { IoCloudUpload } from "react-icons/io5";
import { CiMenuKebab } from "react-icons/ci";
import { FaRupeeSign } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { IoDocuments } from "react-icons/io5";
import { MdDashboardCustomize } from "react-icons/md";
import { FaBriefcase } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import PayNowButton from "../components/PayNowButton";
import {
  FaGraduationCap,
  FaUniversity,
  FaBookOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import {
  FileText,
  ShieldCheck,
  Building2,
  BadgeCheck,
  Flame,
  ClipboardCheck,
  FileBadge,
  BadgePlus,
  Stethoscope,
  Briefcase,
  Calendar,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("documents");
  const [applicationId, setApplicationId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [docTab, setDocTab] = useState("types");
  const [selectedShiftDate, setSelectedShiftDate] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCreatingShift, setIsCreatingShift] = useState(false);
  const [selectedShiftPayRate, setSelectedShiftPayRate] = useState(0);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const profileInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedDesignationId, setSelectedDesignationId] = useState("");
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
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
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [applicantsData, setApplicantsData] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [uploadDrawerDoc, setUploadDrawerDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDocMenu, setShowDocMenu] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const audioRef = useRef(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: null,
  });
  const [dashboardView, setDashboardView] = useState("shifts");
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [approveLoading, setApproveLoading] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(null);
  const [startLoading, setStartLoading] = useState(null);
  const [endLoading, setEndLoading] = useState(null);
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
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
  const maskAccountNumber = (accountNumber = "") => {
    if (!accountNumber) return "--";
    const last4 = accountNumber.slice(-4);
    return "*".repeat(accountNumber.length - 4) + last4;
  };

  const hasRejectedDocs = uploadedDocuments.some(
    (doc) => doc.verificationStatus === "Rejected",
  );
  const selectedUploadedDoc = uploadedDocuments.find(
    (item) => item.documentTypeId === selectedDocument?._id,
  );
  const getUploadedDocByType = (docTypeId) => {
    return uploadedDocuments.find((item) => item.documentTypeId === docTypeId);
  };

  const handleViewFile = () => {
    if (!selectedUploadedDoc?.documentUrl) return;

    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/${selectedUploadedDoc.documentUrl}`;

    window.open(fileUrl, "_blank");
  };
  const fetchHealthcareWorkerById = async (worker) => {
    try {
      setLoadingDocs(true);
      setShowDocumentsPanel(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_GET_BY_ID_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: worker._id }),
        },
      );

      const result = await res.json();

      if (res.ok && Array.isArray(result.data) && result.data.length > 0) {
        setWorkerProfile(result.data[0]);
      } else {
        setWorkerProfile(null);
      }
    } catch (err) {
      console.error("Fetch healthcare worker failed", err);
      setWorkerProfile(null);
    } finally {
      setLoadingDocs(false);
    }
  };
  const handleSubmitDocument = async () => {
    try {
      setIsUploading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_UPDATE_DETAILS_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: selectedUploadedDoc._id,
            issuedBy: issuedBy,
            issueDate: issueDate,
            expiryDate: expiryDate,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Update failed");
        return;
      }

      notify(true, "Details updated successfully");

      await fetchUploadedDocuments();
      setUploadDrawerDoc(null);
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      notify(false, "Server error");
    } finally {
      setIsUploading(false);
    }
  };
  const handleShiftStatusChange = async (shiftId, status) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SHIFT_UPDATE_STATUS_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: shiftId,
            status: status,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Status update failed");
        return;
      }

      notify(true, "Shift status updated");

      fetchAllShifts();
    } catch (err) {
      notify(false, "Server error");
    }
  };
  const handleDeleteDocument = async () => {
    if (!selectedUploadedDoc?._id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    try {
      setIsUploading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_DELETE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: selectedUploadedDoc._id,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Delete failed");
        return;
      }

      notify(true, "Document deleted successfully");

      await fetchUploadedDocuments();

      setUploadDrawerDoc(null);
      setIsEditMode(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Delete error:", err);
      notify(false, "Server error");
    } finally {
      setIsUploading(false);
    }
  };
  const getDocumentIcon = (name = "") => {
    const lower = name.toLowerCase();

    if (lower.includes("license")) return <FileBadge size={20} />;
    if (lower.includes("compliance")) return <ShieldCheck size={20} />;
    if (lower.includes("registration")) return <Building2 size={20} />;
    if (lower.includes("practice")) return <BadgeCheck size={20} />;
    if (lower.includes("tax")) return <ClipboardCheck size={20} />;
    if (lower.includes("fire")) return <Flame size={20} />;

    return <FileText size={20} />;
  };
  const handleApplicantAction = async (app, status) => {
    try {
      if (status === "Approved") setApproveLoading(app._id);
      if (status === "Rejected") setRejectLoading(app._id);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_SHIFT_APPLICATION_ACTION_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: app._id,
            status: status,
            userId: app.userData?._id,
            hospitalName: currentUser?.fullName,
            shiftDate: new Date(selectedShiftDate).toISOString().split("T")[0],
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Action failed");
        return;
      }

      notify(true, `Applicant ${status}`);
      fetchShiftApplications(app.shiftId);
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setApproveLoading(null);
      setRejectLoading(null);
    }
  };
  const fetchDesignations = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DESIGNATION_GET_ALL}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setDesignations(data.data || []);
      }
    } catch (err) {
      console.error("Designation fetch error", err);
    }
  };
  const handlePunchTime = async (app, type) => {
    const applicationId = app._id;
    const workerId = app.userData?._id;

    try {
      if (type === "PunchIn") setStartLoading(app._id);
      if (type === "PunchOut") setEndLoading(app._id);

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
            type: type,
            workerId: workerId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Punch failed");
        return;
      }

      notify(
        true,
        type === "PunchIn"
          ? "Start time recorded successfully"
          : "End time recorded successfully",
      );

      fetchShiftApplications(data.data?.shiftId);

      if (type === "PunchOut") {
        setSelectedApplicationId(app.shiftId);
        setSelectedWorkerId(workerId);
        setApplicationId(app._id);
        setShowFeedbackModal(true);
      }
    } catch (err) {
      notify(false, "Server error");
    } finally {
      if (type === "PunchIn") setStartLoading(null);
      if (type === "PunchOut") setEndLoading(null);
    }
  };
  const handleSubmitFeedback = async () => {
    if (submittingFeedback) return;

    try {
      setSubmittingFeedback(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_REVIEW_CREATE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            shiftId: selectedApplicationId,
            reviewerId: sessionStorage.getItem("userId"),
            reviewerType: "facility",
            targetId: selectedWorkerId,
            targetType: "worker",
            rating: feedbackRating,
            message: feedbackMessage,
            shiftApplicationId: applicationId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Feedback failed");
        return;
      }

      notify(true, "Feedback submitted");

      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackMessage("");
    } catch (err) {
      notify(false, "Server error");
    } finally {
      setSubmittingFeedback(false);
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
  const isUserVerified = currentUser?.verificationStatus === "Verified";

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 FOREGROUND MESSAGE:", payload);

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "New Notification";

      const body = payload.notification?.body || payload.data?.body || "";

      if (Notification.permission === "granted") {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg.showNotification(title, {
            body: body,
            icon: "/logo.png",
          });
        });
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (activePage === "dashboard") {
      fetchAllShifts();
    }
  }, [currentPage]);
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
      console.log("DEPARTMENTS API ", data);

      if (res.ok) {
        setDepartments(data.data || []);
      }
    } catch (err) {
      console.error("Department fetch failed", err);
    }
  };

  const handleCreateShift = async () => {
    if (isCreatingShift) return;

    if (
      !selectedDepartmentId ||
      !selectedDesignationId ||
      !shiftDate ||
      !startTime ||
      !endTime ||
      !requiredStaff ||
      !pay ||
      !locationId
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsCreatingShift(true);

      // Convert shiftDate to ISO
      const isoShiftDate = new Date(shiftDate).toISOString();

      // Convert time to AM/PM format
      const formatTo12Hour = (time) =>
        new Date(`1970-01-01T${time}`)
          .toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase();

      const payload = {
        hospitalId: sessionStorage.getItem("userId"),
        hospitalName: currentUser?.fullName || "",

        departmentId: selectedDepartmentId,
        departmentName: selectedDepartment,

        designationId: selectedDesignationId,
        designationName: selectedDesignation,

        locationId: locationId,
        locationName: location,

        shiftDate: isoShiftDate,

        startTime: formatTo12Hour(startTime),
        endTime: formatTo12Hour(endTime),

        requiredStaff: Number(requiredStaff),
        payRate: Number(pay),

        duties: duties,
        status: "Open",
      };

      console.log("CREATE SHIFT PAYLOAD ", payload);

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

      fetchAllShifts();

      // Reset form
      setSelectedDepartment("");
      setSelectedDepartmentId("");
      setSelectedDesignation("");
      setSelectedDesignationId("");
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
      let profileUpdated = false;
      let addressUpdated = false;

      if (selectedProfileImage) {
        const formData = new FormData();
        formData.append("file", selectedProfileImage);
        formData.append("userId", currentUser?._id);

        const profileRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_UPDATE_PROFILE_API}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          },
        );

        const profileData = await profileRes.json();

        if (!profileRes.ok) {
          notify(false, profileData.message || "Profile image update failed");
          return;
        }

        profileUpdated = true;
      }

      const addressChanged =
        editProfileData.state !== currentUser?.addressData?.stateId ||
        editProfileData.city !== currentUser?.addressData?.cityId ||
        editProfileData.area !== currentUser?.addressData?.addressLine1 ||
        editProfileData.street !== currentUser?.addressData?.addressLine2 ||
        editProfileData.pincode !== currentUser?.addressData?.postalCode ||
        editProfileData.country !== currentUser?.addressData?.country;

      if (addressChanged) {
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

        if (!res.ok) {
          notify(false, data.message || "Address update failed");
          return;
        }

        addressUpdated = true;
      }

      if (profileUpdated || addressUpdated) {
        notify(true, "Profile updated successfully ");
        setShowEditProfileModal(false);
        setSelectedProfileImage(null);
        fetchCurrentUser();
      } else {
        notify(false, "No changes detected");
      }
    } catch (err) {
      console.error("Profile update error:", err);
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
            page: currentPage,
            limit: 10,
          }),
        },
      );

      const data = await res.json();
      console.log("GET SHIFTS RESPONSE ", data);

      if (!res.ok) {
        alert(data.message || "Failed to fetch shifts");
        setShifts([]);
        return;
      }

      const shiftsArray = Array.isArray(data.data?.shifts)
        ? data.data.shifts
        : [];

      setShifts(shiftsArray);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      console.error("Get shifts error ", err);
      setShifts([]);
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (isEditMode && selectedUploadedDoc?._id) {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("sId", selectedUploadedDoc._id);

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_UPDATE_FILE_API}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "File update failed");
          return;
        }

        notify(true, "File updated successfully");

        await fetchUploadedDocuments();
        setSelectedFile(null);
      } catch (err) {
        console.error(err);
        notify(false, "Server error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setIssuedBy("");
    setIssueDate("");
    setExpiryDate("");
    setSelectedFile(null);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <aside
        className={`
  bg-[#4039AD] text-white flex flex-col h-screen fixed left-0 top-0 z-50
  w-[240px] transform transition-transform duration-300
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0 md:w-[240px]
`}
      >
        {/* TOP SECTION */}
        <div>
          {/* LOGO */}
          <div className="flex items-center justify-between px-6 pt-3">
            <img src="/logo.png" className="w-40" />

            <button
              className="md:hidden text-white text-xl"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="-mt-5 text-sm">
            {/* Dashboard */}
            <div
              onClick={() => {
                setActivePage("dashboard");
                fetchAllShifts();
              }}
              className={`px-6 py-3 cursor-pointer flex items-center gap-3 transition
      ${
        activePage === "dashboard"
          ? "bg-white/10"
          : "opacity-80 hover:bg-white/5"
      }
    `}
            >
              <MdDashboardCustomize size={18} />
              <span>Dashboard</span>
            </div>

            {/* Manage Shifts */}
            <div
              onClick={() => {
                if (!isUserVerified) {
                  notify(
                    false,
                    "Your application is still under review. Please contact facility admin.",
                  );
                  return;
                }
                setActivePage("shifts");
              }}
              className={`px-6 py-3 cursor-pointer flex items-center gap-3 transition
      ${activePage === "shifts" ? "bg-white/10" : "opacity-80 hover:bg-white/5"}
    `}
            >
              <FaBriefcase size={16} />
              <span>Manage Shifts</span>
            </div>

            {/* Documents */}
            <div
              onClick={() => setActivePage("documents")}
              className={`px-6 py-3 cursor-pointer flex items-center gap-3 transition
      ${
        activePage === "documents"
          ? "bg-white/10"
          : "opacity-80 hover:bg-white/5"
      }
    `}
            >
              <IoDocuments size={18} />
              <span>Documents</span>
            </div>
          </nav>
        </div>

        {currentUser && (
          <div className="mx-4 mb-6 bg-white/10 rounded-lg p-4 text-xs mt-auto">
            <div className="font-semibold text-white truncate">
              {currentUser.fullName}
            </div>

            <div className="text-yellow-300 mt-1">
              {currentUser.role}Hospital Admin
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleOpenEditModal}
                className="flex items-center gap-1 text-yellow-300"
              >
                <FaEdit />
                <span>Edit</span>
              </button>

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
      </aside>

      <main className="flex-1 md:ml-[240px] p-4 md:p-8 overflow-y-auto min-h-screen">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-[#4039AD]"
          >
            ☰
          </button>

          <img src="/logo.png" className="w-28" />
        </div>
        {activePage === "dashboard" && dashboardView === "shifts" && (
          <>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-100 z-10 py-2">
              {" "}
              <h2 className="text-xl font-semibold">
                Dashboard – Posted Shifts
              </h2>
              <button
                onClick={() => {
                  if (!isUserVerified) {
                    notify(
                      false,
                      "Your application is still under review. Please contact Super admin.",
                    );
                    return;
                  }
                  setActivePage("shifts");
                }}
                className="bg-[#4039AD] text-white px-5 py-2 rounded-lg"
              >
                + Post New Shift
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto h-[calc(100vh-180px)] pr-2">
              {" "}
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

                      <span>📍 {shift.locationName}</span>
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
                        <h4 className="font-semibold text-lg">
                          {shift.designationName}
                        </h4>

                        <p className="text-medium text-black mt-1">
                          Department : {shift.departmentName}
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
                              <div className="flex items-center gap-1 mt-1">
                                {shift.applicants?.slice(0, 3).map((app) => (
                                  <div
                                    key={app._id}
                                    className="w-7 h-7 rounded-full overflow-hidden bg-[#4039AD] text-white text-xs flex items-center justify-center font-semibold"
                                    title={app.fullName}
                                  >
                                    {app.imageUrl ? (
                                      <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${app.imageUrl}`}
                                        alt={app.fullName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      app.fullName?.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                ))}

                                {shift.applicants?.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setSelectedShiftPayRate(shift.payRate);
                                      setSelectedShiftDate(shift.shiftDate);
                                      setSelectedShiftId(shift._id);
                                      fetchShiftApplications(shift._id);
                                      setDashboardView("applicants");
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
                    </div>

                    {/* STATUS */}
                    <div className="flex justify-between items-center mt-4">
                      <select
                        value={shift.status || "Open"}
                        onChange={(e) =>
                          handleShiftStatusChange(shift._id, e.target.value)
                        }
                        className="px-3 py-1 rounded-full text-xs border outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Cancelled">Cancel</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activePage === "dashboard" && dashboardView === "applicants" && (
          <div>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setDashboardView("shifts")}
                className="px-4 py-2 bg-[#4A42B8] rounded-lg text-sm text-white"
              >
                ← Go Back to Dashbaord
              </button>

              <h2 className="text-xl font-semibold">Shift Applicants</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 overflow-x-auto">
              {loadingApplicants ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : applicantsData.length === 0 ? (
                <p className="text-gray-500 text-sm">No applicants found</p>
              ) : (
                <>
                  {(() => {
                    const showActionColumn = applicantsData.some(
                      (app) => !(app.startTime && app.endTime),
                    );

                    return (
                      <div className="overflow-x-auto border rounded-xl">
                        <table className="min-w-[900px] w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr className="text-gray-600 text-xs uppercase tracking-wider">
                              <th className="px-6 py-4 text-left">Applicant</th>

                              <th className="px-6 py-4 text-left whitespace-nowrap">
                                Start Time
                              </th>

                              <th className="px-6 py-4 text-left whitespace-nowrap">
                                End Time
                              </th>

                              <th className="px-6 py-4 text-left">Duration</th>

                              <th className="px-6 py-4 text-left">Pay Rate</th>

                              <th className="px-6 py-4 text-left">Total</th>

                              {showActionColumn && (
                                <th className="px-6 py-4 text-left">Action</th>
                              )}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {applicantsData.map((app) => {
                              const hasStarted = !!app.startTime;
                              const hasEnded = !!app.endTime;
                              const shiftCompleted = hasStarted && hasEnded;

                              let durationMinutes = 0;
                              let totalAmount = 0;

                              if (shiftCompleted) {
                                const start = new Date(app.startTime);
                                const end = new Date(app.endTime);

                                durationMinutes = Math.floor(
                                  (end - start) / (1000 * 60),
                                );

                                const payPerMinute = selectedShiftPayRate / 60;

                                totalAmount = durationMinutes * payPerMinute;
                              }

                              return (
                                <tr
                                  key={app._id}
                                  className="hover:bg-gray-50 transition"
                                >
                                  {/* APPLICANT */}
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

                                      <div>
                                        <p
                                          onClick={() =>
                                            fetchHealthcareWorkerById({
                                              _id: app.userData?._id,
                                            })
                                          }
                                          className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                                        >
                                          {app.userData?.fullName}
                                        </p>

                                        {shiftCompleted && (
                                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                            Shift Completed
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* START */}
                                  <td className="px-6 py-4">
                                    {hasStarted ? (
                                      new Date(app.startTime)
                                        .toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                        .toUpperCase()
                                    ) : (
                                      <button
                                        disabled={
                                          startLoading === app._id ||
                                          app.status !== "Approved" ||
                                          !!app.startTime
                                        }
                                        onClick={() =>
                                          handlePunchTime(app, "PunchIn")
                                        }
                                        className={`px-3 py-1 rounded text-xs text-white flex items-center gap-1
                                ${
                                  app.status !== "Approved"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500"
                                }`}
                                      >
                                        {startLoading === app._id && (
                                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        )}
                                        Start
                                      </button>
                                    )}
                                  </td>

                                  {/* END */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {hasEnded ? (
                                      new Date(app.endTime)
                                        .toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                        .toUpperCase()
                                    ) : (
                                      <button
                                        disabled={
                                          endLoading === app._id ||
                                          app.status !== "Approved" ||
                                          !app.startTime ||
                                          !!app.endTime
                                        }
                                        onClick={() =>
                                          handlePunchTime(app, "PunchOut")
                                        }
                                        className={`px-3 py-1 rounded text-xs text-white flex items-center gap-1
                                ${
                                  !app.startTime
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500"
                                }`}
                                      >
                                        {endLoading === app._id && (
                                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        )}
                                        End
                                      </button>
                                    )}
                                  </td>

                                  {/* DURATION */}
                                  <td className="px-6 py-4">
                                    {shiftCompleted
                                      ? `${(durationMinutes / 60).toFixed(2)} hrs`
                                      : "--"}
                                  </td>

                                  {/* PAY */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    ₹ {selectedShiftPayRate}
                                  </td>

                                  {/* TOTAL + PAY BUTTON */}
                                  <td className="px-6 py-4 font-semibold whitespace-nowrap">
                                    {shiftCompleted ? (
                                      <div className="flex items-center gap-3">
                                        <span>₹ {totalAmount.toFixed(2)}</span>

                                        <PayNowButton
                                          amount={totalAmount}
                                          worker={app}
                                        />
                                      </div>
                                    ) : (
                                      "₹ --"
                                    )}
                                  </td>

                                  {/* ACTION */}
                                  {showActionColumn && (
                                    <td className="px-6 py-4">
                                      {!shiftCompleted && (
                                        <div className="flex items-center gap-3">
                                          <button
                                            disabled={
                                              approveLoading === app._id
                                            }
                                            onClick={() =>
                                              handleApplicantAction(
                                                app,
                                                "Approved",
                                              )
                                            }
                                            className={`px-3 py-1 text-xs rounded flex items-center gap-1 text-white
  ${approveLoading === app._id ? "bg-green-400 cursor-not-allowed" : "bg-green-500"}
  `}
                                          >
                                            {approveLoading === app._id && (
                                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                            {approveLoading === app._id
                                              ? "Approving..."
                                              : "Approve"}
                                          </button>

                                          <button
                                            disabled={rejectLoading === app._id}
                                            onClick={() =>
                                              handleApplicantAction(
                                                app,
                                                "Rejected",
                                              )
                                            }
                                            className={`px-3 py-1 text-xs rounded flex items-center gap-1 text-white
  ${rejectLoading === app._id ? "bg-red-400 cursor-not-allowed" : "bg-red-500"}
  `}
                                          >
                                            {rejectLoading === app._id && (
                                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                            {rejectLoading === app._id
                                              ? "Rejecting..."
                                              : "Reject"}
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        )}

        {activePage === "shifts" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">Post New Shift</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="relative">
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

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDesignationDropdown(!showDesignationDropdown);
                      if (designations.length === 0) fetchDesignations();
                    }}
                    className="border p-2 w-full text-left rounded bg-white flex justify-between items-center"
                  >
                    <span>{selectedDesignation || "Select Designation"}</span>

                    <span
                      className={`transform transition-transform duration-200 ${
                        showDesignationDropdown ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {showDesignationDropdown && (
                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-48 overflow-y-auto">
                      {designations.map((desig) => (
                        <div
                          key={desig._id}
                          onClick={() => {
                            setSelectedDesignation(desig.designationName);
                            setSelectedDesignationId(desig._id);
                            setShowDesignationDropdown(false);
                          }}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {desig.designationName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <input
                type="date"
                className="border p-2 w-full mb-3"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* START TIME */}
                <div>
                  <input
                    type="time"
                    className="border p-2 w-full"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />

                  {startTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(`1970-01-01T${startTime}`)
                        .toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .toUpperCase()}
                    </p>
                  )}
                </div>

                {/* END TIME */}
                <div>
                  <input
                    type="time"
                    className="border p-2 w-full"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />

                  {endTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(`1970-01-01T${endTime}`)
                        .toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              <input
                className="border p-2 w-full mb-3"
                placeholder="Required Staff"
                value={requiredStaff}
                onChange={(e) => setRequiredStaff(e.target.value)}
              />
              <span className="flex items-center gap-2">
                <FaRupeeSign />
                Pay Rate
              </span>
              <input
                className="border p-2 w-full mb-3"
                placeholder="Pay"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
              />
              <span className="flex items-center gap-2">
                <IoLocationSharp /> Location
              </span>
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
              <div className="space-y-4">
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
                      <span>📍 {shift.locationName}</span>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex gap-4">
                      {/* DATE BOX */}
                      <div className="w-[60px] rounded-md overflow-hidden text-center shadow-sm">
                        <div className="bg-[#4039AD] text-white text-xl font-bold py-2">
                          {new Date(shift.shiftDate).getDate()}
                        </div>
                        <div className="bg-[#4039AD] text-white text-xs font-semibold py-1">
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
                        <h4 className="font-semibold text-lg">
                          {shift.designationName}
                        </h4>

                        <p className="text-xs text-black mt-1">
                          Department : {shift.departmentName}
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
                              <div className="flex items-center gap-1 mt-1">
                                {shift.applicants?.slice(0, 3).map((app) => (
                                  <div
                                    key={app._id}
                                    className="w-7 h-7 rounded-full overflow-hidden bg-[#4039AD] text-white text-xs flex items-center justify-center font-semibold"
                                    title={app.fullName}
                                  >
                                    {app.imageUrl ? (
                                      <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${app.imageUrl}`}
                                        alt={app.fullName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      app.fullName?.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                ))}

                                {shift.applicants?.length > 0 && (
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
          </div>
        )}
        {activePage === "documents" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="col-span-5 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
              {/* HEADER */}
              <div className="px-6 py-5 border-b">
                <h2 className="text-sm font-semibold text-gray-700">
                  Required Documents
                </h2>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto p-6 ">
                {documents.map((doc) => {
                  const uploadedDoc = getUploadedDocByType(doc._id);

                  return (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`flex items-center justify-between bg-gray-50 rounded-xl px-4 py-4 cursor-pointer hover:shadow-sm transition ${
                        selectedDocument?._id === doc._id
                          ? "border border-[#4039AD]"
                          : ""
                      }`}
                    >
                      {/* LEFT SIDE */}
                      <div className="flex items-center gap-4 transition-all  hover:bg-[#4039AD]/5   cursor-pointer">
                        <div className="w-5 h-5 text-[#4039AD]">
                          {getDocumentIcon(doc.name || doc.documentName)}
                        </div>

                        <p className="text-sm">
                          {doc.name || doc.documentName}
                        </p>
                      </div>

                      {/* STATUS BADGE */}
                      {uploadedDoc ? (
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getStatusColor(uploadedDoc.verificationStatus)}`}
                        >
                          {uploadedDoc.verificationStatus || "Pending"}
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                          Not Uploaded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE – PREVIEW BOX */}
            <div className="col-span-7 bg-white rounded-2xl shadow-sm p-8">
              {!selectedDocument ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="w-44 h-44 mb-4 bg- text-black rounded-2xl flex items-center justify-center">
                    <IoDocuments size={120} />
                  </div>
                  <p className="text-medium text-black">
                    {" "}
                    Please Select and Upload documents
                  </p>
                </div>
              ) : !selectedUploadedDoc ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="w-24 h-24 mb-4 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center text-4xl">
                    ⚠
                  </div>
                  <p className="text-sm font-medium">
                    {selectedDocument.name || selectedDocument.documentName}
                  </p>
                  <p className="text-xs mt-2 mb-4">
                    This document has not been uploaded yet.
                  </p>

                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setUploadDrawerDoc(selectedDocument);

                      // Reset everything
                      setIssuedBy("");
                      setIssueDate("");
                      setExpiryDate("");
                      setSelectedFile(null);
                    }}
                    className="bg-[#4039AD] text-white px-5 py-2 rounded-lg text-xs flex items-center gap-2"
                  >
                    <LuUpload size={14} />
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* HEADER */}
                  {/* HEADER */}
                  <div className="flex items-center justify-between border-b pb-6 relative">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-100 text-[#4039AD] rounded-xl flex items-center justify-center text-2xl">
                        📄
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedUploadedDoc.documentName}
                        </h3>

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedUploadedDoc.verificationStatus)}`}
                        >
                          {selectedUploadedDoc.verificationStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-3 relative">
                      {/* VIEW FILE */}
                      <button
                        onClick={handleViewFile}
                        className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                      >
                        <LuEye size={16} />
                        View File
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setShowDocMenu(!showDocMenu)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                          <CiMenuKebab size={18} />
                        </button>

                        {showDocMenu && (
                          <div className="absolute right-0 mt-2 w-52 bg-[#0f1c2e] text-white rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                            <button
                              onClick={() => {
                                setIsEditMode(true);
                                setUploadDrawerDoc(selectedUploadedDoc);

                                // Prefill
                                setIssuedBy(selectedUploadedDoc.issuedBy || "");
                                setIssueDate(
                                  selectedUploadedDoc.issueDate
                                    ? selectedUploadedDoc.issueDate.split(
                                        "T",
                                      )[0]
                                    : "",
                                );
                                setExpiryDate(
                                  selectedUploadedDoc.expiryDate
                                    ? selectedUploadedDoc.expiryDate.split(
                                        "T",
                                      )[0]
                                    : "",
                                );

                                setShowDocMenu(false);
                              }}
                              className="w-full text-left px-5 py-3 text-sm hover:bg-white/10 transition"
                            >
                              View/Edit Document
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Issued By</p>
                      <p className="font-medium">
                        {selectedUploadedDoc.issuedBy || "--"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs">Issue Date</p>
                      <p className="font-medium">
                        {formatDate(selectedUploadedDoc.issueDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs">Expiry Date</p>
                      <p className="font-medium">
                        {formatDate(selectedUploadedDoc.expiryDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs">Uploaded On</p>
                      <p className="font-medium">
                        {formatDate(selectedUploadedDoc.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-[750px] max-h-[90vh] overflow-y-auto">
              {/* HEADER PROFILE SECTION */}
              <div className="flex items-center gap-4 p-6 border-b">
                <img
                  src={
                    selectedProfileImage
                      ? URL.createObjectURL(selectedProfileImage)
                      : currentUser?.imageUrl
                        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${currentUser.imageUrl}`
                        : "https://i.pravatar.cc/100"
                  }
                  alt="Profile"
                  onClick={() => profileInputRef.current.click()}
                  className="w-16 h-16 rounded-full object-cover border-4 border-[#4039AD] cursor-pointer"
                />

                <input
                  type="file"
                  ref={profileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setSelectedProfileImage(e.target.files[0]);
                    }
                  }}
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
        {uploadDrawerDoc && (
          <div className="fixed inset-0 z-50 flex">
            {/* OVERLAY */}
            <div
              onClick={() => {
                setUploadDrawerDoc(null);
                setIsEditMode(false);
                setSelectedFile(null);
              }}
              className="flex-1 bg-black/40 backdrop-blur-sm transition-opacity"
            />

            {/* RIGHT SLIDE PANEL */}
            <div
              className={`w-[500px] h-full bg-white shadow-2xl p-6 transform transition-all duration-300 ease-in-out ${
                uploadDrawerDoc ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="font-semibold text-lg">
                  {isEditMode ? "Edit" : "Upload"}{" "}
                  {uploadDrawerDoc.name || uploadDrawerDoc.documentName}
                </h3>

                <button
                  onClick={() => {
                    setUploadDrawerDoc(null);
                    setIsEditMode(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* FORM */}
              <div className="space-y-5">
                {/* ISSUED BY */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Issued By
                  </label>
                  <input
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    placeholder="Enter issuing authority"
                    className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                  />
                </div>

                {/* ISSUE DATE */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                  />
                </div>

                {/* EXPIRY DATE */}
                {uploadDrawerDoc?.isExipreDate && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                    />
                  </div>
                )}

                {/* FILE SECTION */}
                <div className="space-y-3">
                  {/* EXISTING FILE (EDIT MODE ONLY) */}
                  {isEditMode &&
                    selectedUploadedDoc?.documentUrl &&
                    !selectedFile && (
                      <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <LuEye size={16} />
                          <span className="truncate max-w-[180px]">
                            {selectedUploadedDoc.documentUrl}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleViewFile}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                          >
                            View
                          </button>

                          <button
                            onClick={handleDeleteDocument}
                            disabled={isUploading}
                            className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                  {(!isEditMode || !selectedUploadedDoc?.documentUrl) && (
                    <div
                      onClick={handleUploadClick}
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
                    >
                      {selectedFile ? (
                        <p className="text-sm font-medium text-gray-700">
                          {selectedFile.name}
                        </p>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                          <IoCloudUpload size={34} className="text-[#4039AD]" />
                          <p className="text-sm font-medium">
                            Drag & Drop or Browse
                          </p>
                          <span className="text-xs text-gray-400">
                            PDF, JPG, PNG supported
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <button
                    onClick={() => handleSubmitDocument("details")}
                    disabled={isUploading}
                    className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3"
                  >
                    Save Details
                  </button>
                )}

                {!isEditMode && (
                  <button
                    onClick={() => handleSubmitDocument()}
                    disabled={isUploading}
                    className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3"
                  >
                    Submit Document
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {activePage === "dashboard" && totalPages > 1 && (
          <div className="fixed bottom-6 right-8 flex items-center gap-6 bg-white shadow-lg border px-6 py-3 rounded-2xl">
            {/* PREVIOUS */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
        ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#4039AD] text-white hover:opacity-90"
        }`}
            >
              Previous
            </button>

            {/* PAGE INFO */}
            <span className="text-sm font-semibold text-gray-700">
              {currentPage} / {totalPages}
            </span>

            {/* NEXT */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
        ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#4039AD] text-white hover:opacity-90"
        }`}
            >
              Next
            </button>
          </div>
        )}
      </main>
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl shadow-xl p-6 relative">
            {/* CLOSE */}
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute right-4 top-4 text-gray-400"
            >
              ✕
            </button>

            {/* TITLE */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Submit Your Feedback</h2>
            </div>

            {/* STARS */}
            <div className="flex justify-center gap-3 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`text-2xl ${
                    star <= feedbackRating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* MESSAGE */}
            <textarea
              placeholder="Your Message..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm mb-5"
            />

            {/* BUTTON */}
            <button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2
  ${submittingFeedback ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"}
  text-white`}
            >
              {submittingFeedback && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}

              {submittingFeedback ? "Submitting..." : "Send Feedback"}
            </button>
          </div>
        </div>
      )}
      <div className="col-span-6">
        {showDocumentsPanel && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-[1000px] max-h-[90vh] overflow-y-auto relative">
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      workerProfile?.imageUrl
                        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${workerProfile.imageUrl}`
                        : "https://via.placeholder.com/150"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#2563EB]">
                        {workerProfile?.fullName || "--"}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(workerProfile?.verificationStatus)}`}
                      >
                        {workerProfile?.verificationStatus || "Pending"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {workerProfile?.email}
                    </p>
                  </div>
                </div>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setShowDocumentsPanel(false)}
                  className="text-gray-500 hover:text-black text-xl font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-8 px-6 pt-4 border-b text-sm font-medium">
                {[
                  { key: "personal", label: "Personal Details" },
                  { key: "bank", label: "Bank Details" },
                  { key: "experience", label: "Experience" },
                  { key: "availability", label: "Availability" },
                  { key: "qualification", label: "Qualification" },
                  { key: "prefernce", label: "Preference" },
                  { key: "documents", label: "Documents" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveProfileTab(tab.key)}
                    className={`pb-3 transition ${
                      activeProfileTab === tab.key
                        ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* CONTENT */}
              <div className="p-6">
                {loadingDocs ? (
                  <div className="flex items-center justify-center py-16"></div>
                ) : !workerProfile ? (
                  <p className="text-center text-sm text-gray-500">
                    No data found
                  </p>
                ) : (
                  <>
                    {/* PERSONAL DETAILS */}
                    {activeProfileTab === "personal" && (
                      <div className="border rounded-xl p-6 grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            FULL NAME
                          </p>
                          <p className="font-semibold">
                            {workerProfile.fullName}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            EMAIL ADDRESS
                          </p>
                          <p className="font-semibold">{workerProfile.email}</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            MOBILE NUMBER
                          </p>
                          <p className="font-semibold">
                            {workerProfile.mobileNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            DATE OF BIRTH
                          </p>
                          <p className="font-semibold">
                            {workerProfile.dob || "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">GENDER</p>
                          <p className="font-semibold">
                            {workerProfile.gender || "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            ACCOUNT STATUS
                          </p>
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            {workerProfile.accountStatus}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">ADDRESS</p>
                          <p className="font-semibold">
                            {workerProfile.addressData?.addressLine1},
                            {workerProfile.addressData?.addressLine2},
                            {workerProfile.addressData?.city},
                            {workerProfile.addressData?.state},
                            {workerProfile.addressData?.country},
                            {workerProfile.addressData?.postalCode},
                          </p>
                        </div>
                      </div>
                    )}

                    {/* BANK DETAILS */}
                    {activeProfileTab === "bank" && (
                      <div className="grid grid-cols-3 gap-6">
                        {/* LEFT BANK CARD */}
                        <div className="col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
                          {/* HEADER */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                🏦
                              </div>
                              <h4 className="font-semibold text-base">
                                Banking Information
                              </h4>
                            </div>

                            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                              VERIFIED
                            </span>
                          </div>

                          {workerProfile.bankData ? (
                            <>
                              {/* GRID */}
                              <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm">
                                <div>
                                  <p className="text-xs text-black-300 mb-1 uppercase">
                                    Account Holder
                                  </p>
                                  <p className="font-medium">
                                    {workerProfile.bankData.accountHolderName}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-black-300 mb-1 uppercase">
                                    Bank Name
                                  </p>
                                  <p className="font-medium">
                                    {workerProfile.bankData.bankName}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-black-400 mb-1 uppercase">
                                    Account Number
                                  </p>

                                  <div className="flex items-center gap-2">
                                    <p className="font-medium tracking-wider">
                                      {maskAccountNumber(
                                        workerProfile.bankData.accountNumber,
                                      )}
                                    </p>

                                    <span
                                      className="cursor-pointer text-gray-400 text-xs"
                                      title="Copy full account number"
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          workerProfile.bankData.accountNumber,
                                        )
                                      }
                                    >
                                      📋
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-black-300 mb-1 uppercase">
                                    Account Type
                                  </p>
                                  <p className="font-medium">
                                    {workerProfile.bankData.accountType}
                                  </p>
                                </div>
                              </div>

                              {/* BRANCH IDENTIFIER */}
                              <div className="mt-6">
                                <p className="text-xs text-black-300 mb-1 uppercase">
                                  Branch Identifier
                                </p>
                                <div className="bg-gray-50 border rounded-lg px-4 py-3 text-sm text-gray-700 break-all">
                                  {workerProfile.bankData.branchName}
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-400 text-sm">
                              No bank details found
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* EXPERIENCE */}
                    {activeProfileTab === "experience" && (
                      <div className="bg-gray-50 border rounded-xl p-6 space-y-6">
                        {workerProfile.experiencesData?.length > 0 ? (
                          workerProfile.experiencesData.map((exp, i) => (
                            <div
                              key={i}
                              className="bg-white border rounded-xl shadow-sm p-6 space-y-6"
                            >
                              {/* Top Grid Section */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Hospital */}
                                <div className="flex items-start gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">
                                      Hospital
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                      {exp.hospitalName}
                                    </p>
                                  </div>
                                </div>

                                {/* Designation */}
                                <div className="flex items-start gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-lg">
                                    <BadgePlus className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">
                                      Designation
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                      {exp.designation}
                                    </p>
                                  </div>
                                </div>

                                {/* Department */}
                                <div className="flex items-start gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">
                                      Department
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                      {exp.department}
                                    </p>
                                  </div>
                                </div>

                                {/* Employment */}
                                <div className="flex items-start gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">
                                      Employment
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                      {exp.employmentType}
                                    </p>
                                  </div>
                                </div>

                                {/* Duration */}
                                <div className="flex items-start gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase">
                                      Duration
                                    </p>
                                    <p className="font-semibold text-gray-800">
                                      {new Date(
                                        exp.startDate,
                                      ).toLocaleDateString()}{" "}
                                      —{" "}
                                      {exp.isCurrentlyWorking
                                        ? "Present"
                                        : new Date(
                                            exp.endDate,
                                          ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="border-t pt-5 flex gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg h-fit">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase mb-1">
                                    Role Description
                                  </p>
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {exp.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400">No experience added</p>
                        )}
                      </div>
                    )}
                    {activeProfileTab === "qualification" && (
                      <div className="space-y-6">
                        {/* HEADER */}
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FaGraduationCap className="text-[#4039AD]" />
                            Qualification Details
                          </h3>
                        </div>

                        {/* LIST */}
                        {workerProfile.qualificationsData?.length > 0 ? (
                          workerProfile.qualificationsData
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((qual) => {
                              const docUrl = qual.documentUrl
                                ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${qual.documentUrl}`
                                : null;

                              return (
                                <div
                                  key={qual._id}
                                  className="bg-white border rounded-xl shadow-sm p-6"
                                >
                                  {/* TOP ROW */}
                                  <div className="flex justify-between items-center mb-5">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                        <FaGraduationCap />
                                      </div>
                                      <h4 className="text-[#4039AD] font-semibold">
                                        {qual.education}
                                      </h4>
                                    </div>

                                    {docUrl && (
                                      <button
                                        onClick={() =>
                                          window.open(docUrl, "_blank")
                                        }
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
                                      >
                                        <FaEye />
                                        View Document
                                      </button>
                                    )}
                                  </div>

                                  {/* GRID CONTENT */}
                                  <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
                                    {/* Institution */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaUniversity className="text-gray-400" />
                                        Institution
                                      </p>
                                      <p className="font-medium">
                                        {qual.institution}
                                      </p>
                                    </div>

                                    {/* Course */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaBookOpen className="text-gray-400" />
                                        Course
                                      </p>
                                      <p className="font-medium">
                                        {qual.course}
                                      </p>
                                    </div>

                                    {/* Specialization */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                        Specialization
                                      </p>
                                      <p className="font-medium">
                                        {qual.specialization}
                                      </p>
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaCalendarAlt className="text-gray-400" />
                                        Duration
                                      </p>
                                      <p className="font-medium">
                                        {qual.startYear} – {qual.endYear}
                                      </p>
                                    </div>

                                    {/* Course Type */}
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                                        <FaClock className="text-gray-400" />
                                        Course Type
                                      </p>
                                      <p className="font-medium">
                                        {qual.courseType}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No qualification details available
                          </p>
                        )}
                      </div>
                    )}

                    {/* AVAILABILITY */}
                    {activeProfileTab === "availability" && (
                      <div className="border rounded-xl p-6 text-sm text-gray-500">
                        Availability module not implemented yet
                      </div>
                    )}

                    {activeProfileTab === "documents" && (
                      <div className="border rounded-xl p-6 space-y-4">
                        {workerProfile?.documentsData?.length === 0 ? (
                          <p className="text-gray-400 text-sm">
                            No documents uploaded
                          </p>
                        ) : (
                          workerProfile?.documentsData?.map((doc) => {
                            const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.documentUrl}`;

                            return (
                              <div
                                key={doc._id}
                                className="grid grid-cols-6 items-center border rounded-lg px-4 py-3 text-sm"
                              >
                                <div className="font-semibold text-gray-800">
                                  {doc.documentName}
                                </div>

                                <div>
                                  {doc.expiryDate
                                    ? new Date(
                                        doc.expiryDate,
                                      ).toLocaleDateString()
                                    : "--"}
                                </div>

                                <div>
                                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                    {doc.verificationStatus || "Pending"}
                                  </span>
                                </div>

                                <div>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#4039AD] underline text-xs"
                                  >
                                    View
                                  </a>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
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
                onClick={async () => {
                  if (isLoggingOut) return;

                  try {
                    setIsLoggingOut(true);

                    const token = sessionStorage.getItem("token");
                    const fcmToken = sessionStorage.getItem("fcmToken");

                    if (fcmToken && token) {
                      await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_UPDATE_FCM_API}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            fcm: fcmToken,
                            type: "Logout",
                          }),
                        },
                      );
                    }

                    sessionStorage.clear();

                    notify(true, "Logged out successfully");
                    setShowLogoutModal(false);

                    setTimeout(() => {
                      navigate("/login");
                    }, 800);
                  } catch (err) {
                    console.error("Logout FCM error:", err);
                    notify(false, "Logout failed");
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
                className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
    ${
      isLoggingOut
        ? "bg-gray-400 cursor-not-allowed text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }
  `}
              >
                {isLoggingOut && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}

                {isLoggingOut ? "Logging out..." : "Log Out →"}
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
    </div>
  );
};

export default Dashboard;
