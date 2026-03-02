import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { MdDashboardCustomize } from "react-icons/md";
import { baseUrl, notify, urls } from "../constants/config";
import { getStatusColor } from "../utils/statusColors";
import { messaging } from "../firebase";
import { onMessage } from "firebase/messaging";
import AdvancedPeopleLoader from "../components/AdvancedPeopleLoader";
import { GrDocumentUser, GrUserWorker } from "react-icons/gr";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineCastForEducation } from "react-icons/md";

import {
  Building2,
  BadgePlus,
  Stethoscope,
  Briefcase,
  Calendar,
  FileText,
} from "lucide-react";

import {
  FaGraduationCap,
  FaUniversity,
  FaBookOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
const Dashboard2 = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerDocuments, setWorkerDocuments] = useState([]);
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [referTo, setReferTo] = useState(1);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [departments, setDepartments] = useState([]);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptStatus, setNewDeptStatus] = useState(true);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showDocTypeModal, setShowDocTypeModal] = useState(false);
  const [docTypeName, setDocTypeName] = useState("");
  const [docTypeExpiry, setDocTypeExpiry] = useState(true);
  const [Workers2, setWorkers2] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [statesList, setStatesList] = useState([]);
  const [showCreateStateModal, setShowCreateStateModal] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [locationTab, setLocationTab] = useState("state"); // state | city
  const [newCityName, setNewCityName] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [citiesList, setCitiesList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [isCreatingDocType, setIsCreatingDocType] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [showAddDesignation, setShowAddDesignation] = useState(false);
  const [newDesignation, setNewDesignation] = useState("");
  const [designationStatus, setDesignationStatus] = useState("Active");
  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [selectedWorkerAddress, setSelectedWorkerAddress] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState("");
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [loadingHealthcareWorkers, setLoadingHealthcareWorkers] =
    useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [verifyingAction, setVerifyingAction] = useState(null);
  const [processingDocId, setProcessingDocId] = useState(null);

  // Workers Pagination
  const [workersPage, setWorkersPage] = useState(1);
  const [workersLimit] = useState(10);
  const [workersTotalPages, setWorkersTotalPages] = useState(1);
  const [workersTotalCount, setWorkersTotalCount] = useState(0);

  // Departments Pagination
  const [departmentsPage, setDepartmentsPage] = useState(1);

  const itemsPerPage = 10;

  const goToNextWorkersPage = () => {
    if (workersPage < workersTotalPages) {
      setWorkersPage((prev) => prev + 1);
    }
  };

  const goToPreviousWorkersPage = () => {
    if (workersPage > 1) {
      setWorkersPage((prev) => prev - 1);
    }
  };

  const departmentsIndexOfLast = departmentsPage * itemsPerPage;
  const departmentsIndexOfFirst = departmentsIndexOfLast - itemsPerPage;

  const currentDepartments = departments.slice(
    departmentsIndexOfFirst,
    departmentsIndexOfLast,
  );

  const departmentsTotalPages = Math.ceil(departments.length / itemsPerPage);

  const goToNextDepartmentsPage = () => {
    if (departmentsPage < departmentsTotalPages) {
      setDepartmentsPage((prev) => prev + 1);
    }
  };

  const goToPreviousDepartmentsPage = () => {
    if (departmentsPage > 1) {
      setDepartmentsPage((prev) => prev - 1);
    }
  };

  const [documentTypesPage, setDocumentTypesPage] = useState(1);
  const documentTypesPerPage = 10;

  const indexOfLastDoc = documentTypesPage * documentTypesPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentTypesPerPage;

  const currentDocumentTypes = documentTypes.slice(
    indexOfFirstDoc,
    indexOfLastDoc,
  );

  const documentTypesTotalPages = Math.ceil(
    documentTypes.length / documentTypesPerPage,
  );

  const goToPreviousDocPage = () => {
    if (documentTypesPage > 1) {
      setDocumentTypesPage((prev) => prev - 1);
    }
  };

  const goToNextDocPage = () => {
    if (documentTypesPage < documentTypesTotalPages) {
      setDocumentTypesPage((prev) => prev + 1);
    }
  };
  const [healthcarePage, setHealthcarePage] = useState(1);
  const healthcareItemsPerPage = 10;

  const healthcareLastIndex = healthcarePage * healthcareItemsPerPage;
  const healthcareFirstIndex = healthcareLastIndex - healthcareItemsPerPage;

  const currentHealthcareWorkers = workers.slice(
    healthcareFirstIndex,
    healthcareLastIndex,
  );

  const healthcareTotalPages = Math.ceil(
    workers.length / healthcareItemsPerPage,
  );

  const goToNextHealthcarePage = () => {
    if (healthcarePage < healthcareTotalPages) {
      setHealthcarePage((prev) => prev + 1);
    }
  };

  const goToPreviousHealthcarePage = () => {
    if (healthcarePage > 1) {
      setHealthcarePage((prev) => prev - 1);
    }
  };
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fcmToken = sessionStorage.getItem("fcmToken");

      if (token && fcmToken) {
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

        console.log(" FCM removed on logout");
      }
    } catch (err) {
      console.error("Logout FCM error:", err);
    } finally {
      sessionStorage.clear();
      notify(false, "Logged out successfully");

      setTimeout(() => {
        navigate("/login");
      }, 600);
    }
  };

  const handleSaveDesignation = async () => {
    if (!newDesignation.trim()) {
      notify(false, "Designation name required");
      return;
    }

    try {
      const bodyData = {
        designationName: newDesignation.trim(),
        status: designationStatus,
        ...(editingDesignationId && { sId: editingDesignationId }),
      };
      console.log("Sending Body 👉", bodyData);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DESIGNATION_CREATE_UPDATE}`,
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

      if (!res.ok || data.status === false) {
        notify(false, data.message || "Failed");
        return;
      }

      notify(
        true,
        editingDesignationId ? "Updated successfully" : "Created successfully",
      );

      setShowAddDesignation(false);
      setEditingDesignationId(null);
      setNewDesignation("");
      setDesignationStatus("Active");

      fetchDesignations();
    } catch (err) {
      notify(false, "Server error");
    }
  };
  const fetchAddressByUserId = async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_ADDRESS_GET_BY_USER_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: userId,
          }),
        },
      );

      const data = await res.json();

      if (
        res.ok &&
        data.status &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        setSelectedWorkerAddress(data.data[0]);
      } else {
        setSelectedWorkerAddress(null);
      }
    } catch (err) {
      console.error("Address fetch error:", err);
      setSelectedWorkerAddress(null);
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

      if (!res.ok) {
        notify(false, data.message || "Failed to fetch designations");
        return;
      }

      setDesignations(data.data || []);
    } catch (err) {
      notify(false, "Server error");
    }
  };
  const handleSaveProfile = async () => {
    try {
      if (!editProfileData.state || !editProfileData.city) {
        alert("Please select state and city");
        return;
      }

      const selectedState = statesList.find(
        (s) => s._id === editProfileData.state,
      );

      const selectedCity = citiesList.find(
        (c) => c._id === editProfileData.city,
      );

      const bodyData = {
        sId: currentUser?.addressData?._id || "", // for update case
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

      console.log("Sending Address Body", bodyData);

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
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Address update error:", err);
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
        setCurrentUser(data.data[0]);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Fetch current user error:", err);
    }
  };

  const maskAccountNumber = (accountNumber = "") => {
    if (!accountNumber) return "--";
    const last4 = accountNumber.slice(-4);
    return "*".repeat(accountNumber.length - 4) + last4;
  };

  const avatarColors = [
    "bg-indigo-100 text-indigo-600",
    "bg-emerald-100 text-emerald-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-sky-100 text-sky-600",
    "bg-purple-100 text-purple-600",
  ];

  const getAvatarColor = (name = "") => {
    const charCode = name.charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
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
          body: JSON.stringify({
            type: 1,
          }),
        },
      );

      const data = await res.json();
      console.log("STATE DATA:", data);

      if (res.ok) {
        setStatesList(data.data || []);
      } else {
        console.error("Failed:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);

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

      if (res.ok) {
        setDepartments(data.data || []);
      }
    } catch (err) {
      console.error("Department fetch failed", err);
    } finally {
      setLoadingDepartments(false);
    }
  };
  const handleCreateState = async () => {
    if (!newStateName.trim()) {
      alert("State name required");
      return;
    }

    console.log("STATE FUNCTION CALLED");
    console.log("Sending type:", 1);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LOCATION_CREATE_STATE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: newStateName,
            type: 1,
          }),
        },
      );

      const data = await res.json().catch(() => null);

      console.log("STATE RESPONSE:", data);

      if (!res.ok) {
        alert(data?.message || "State creation failed");
        return;
      }

      notify(true, "State created successfully");
      setNewStateName("");
      setShowCreateStateModal(false);
      fetchStates(); //  refresh table
    } catch (err) {
      console.error("Create state error:", err);
      alert("Server error while creating state");
    }
  };

  const handleCreateCity = async () => {
    if (!newCityName.trim()) {
      alert("City name required");
      return;
    }

    if (!selectedStateId) {
      alert("Please select state");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_LOCATION_CREATE_CITY_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: newCityName,
            type: 2,
            parentId: selectedStateId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "City creation failed");
        return;
      }

      notify(true, "City created successfully");
      setNewCityName("");
      setSelectedStateId("");
      setShowCreateStateModal(false);
      fetchCities();
    } catch (err) {
      console.error("Create city error", err);
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
          body: JSON.stringify({
            type: 2,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setCitiesList(data.data || []);
      }
    } catch (err) {
      console.error("Fetch cities error", err);
    }
  };

  const handleAddDepartment = async () => {
    if (isCreatingDept) return;

    if (!newDeptName.trim()) {
      notify(false, "Department name is required");
      return;
    }

    try {
      setIsCreatingDept(true);

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
        notify(false, data?.message || "Department creation failed");
        return;
      }

      notify(true, "Department created successfully");

      setNewDeptName("");
      setNewDeptStatus(true);
      setShowCreateDept(false);
      fetchDepartments();
    } catch (err) {
      notify(false, "Something went wrong");
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleCreateDocumentType = async () => {
    if (isCreatingDocType) return;

    if (!docTypeName.trim()) {
      notify(false, "Document name is required");
      return;
    }

    try {
      setIsCreatingDocType(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_TYPE_CREATE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            documentName: docTypeName,
            isExipreDate: docTypeExpiry,
            referTo: referTo,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data?.message || "Document type creation failed");
        return;
      }

      notify(true, "Document created successfully");

      setDocTypeName("");
      setDocTypeExpiry(true);
      setReferTo(1);
      setShowDocTypeModal(false);
      fetchDocumentTypes();
    } catch (err) {
      notify(false, "Something went wrong");
    } finally {
      setIsCreatingDocType(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_TYPE_GET_ALL_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({}),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setDocumentTypes(data.data || []);
      }
    } catch (err) {
      console.error("Document types fetch failed", err);
    }
  };

  const fetchWorkers = async (page = 1) => {
    try {
      setLoadingWorkers(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_GET_ALL_WORKERS_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            roleId: 2,
            page: page,
            limit: workersLimit,
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.status) {
        const workerList = data.data?.data || data.data || [];

        setWorkers(workerList);

        const totalCount =
          data.data?.totalCount || data.totalCount || workerList.length;

        setWorkersTotalCount(totalCount);
        setWorkersTotalPages(Math.ceil(totalCount / workersLimit));
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoadingWorkers(false);
    }
  };
  const fetchWorkerDocuments = async (worker) => {
    try {
      setLoadingDocs(true);
      setSelectedWorker(worker);
      fetchAddressByUserId(worker._id);
      setShowDocumentsPanel(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_GET_ALL_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ id: worker._id }),
        },
      );

      const data = await res.json();

      // SAFETY: always array
      const docs = Array.isArray(data.data)
        ? data.data
        : data.data?.documents || [];

      setWorkerDocuments(docs);
    } catch (err) {
      console.error("Fetch worker documents failed", err);
      setWorkerDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };
  const fetchWorkers2 = async () => {
    try {
      setLoadingHealthcareWorkers(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_GET_ALL_WORKERS_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ roleId: 3 }),
        },
      );

      const data = await res.json();

      const list =
        data?.data?.workers ||
        data?.data ||
        data?.healthCareWorkers ||
        data?.workers ||
        [];

      if (res.ok) {
        setWorkers(list);
      }
    } catch (err) {
      console.error("Healthcare workers fetch failed", err);
    } finally {
      setLoadingHealthcareWorkers(false);
    }
  };

  const verifyHealthcareWorker = async (userId, status) => {
    if (verifyingAction) return;

    try {
      setVerifyingAction(status); // 👈 track which button clicked

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_HEALTHCARE_WORKER_VERIFY_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: userId,
            verificationStatus: status,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setWorkerProfile((prev) => ({
          ...prev,
          verificationStatus: status,
        }));

        setWorkers((prevWorkers) =>
          prevWorkers.map((worker) =>
            worker._id === userId
              ? { ...worker, verificationStatus: status }
              : worker,
          ),
        );

        notify(true, `Worker ${status} successfully`);
      } else {
        notify(false, data.message || "Verification failed");
      }
    } catch (err) {
      notify(false, "Something went wrong");
    } finally {
      setVerifyingAction(null); // 👈 reset
    }
  };

  const fetchHealthcareWorkerById = async (worker) => {
    try {
      setLoadingDocs(true);
      setSelectedWorker(worker);
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

      console.log("API RESPONSE 👉", result);

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

  const handleVerify = async (
    docId,
    status,
    reason = null,
    documentName = "",
  ) => {
    if (processingDocId) return;

    try {
      setProcessingDocId(docId);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_VERIFY_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: docId,
            verificationStatus: status,
            rejectionReason: reason,
            email: selectedWorker?.email,
            documentName: documentName,
            facilityName: selectedWorker?.fullName,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        notify(true, `Document ${status}`);

        // 🔥 NO REFRESH
        setWorkerDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc._id === docId ? { ...doc, verificationStatus: status } : doc,
          ),
        );
      } else {
        notify(false, data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verify error", err);
    } finally {
      setProcessingDocId(null);
    }
  };
  useEffect(() => {
    fetchWorkers(workersPage);
  }, [workersPage]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  useEffect(() => {
    if (activeProfileTab === "documents" && workerProfile?._id) {
      fetchWorkerDocuments(workerProfile);
    }
  }, [activeProfileTab, workerProfile]);

  useEffect(() => {
    if (showCreateStateModal) {
      fetchStates();
    }
  }, [showCreateStateModal]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "--";

  return (
    <div className="h-screen flex bg-[#f3f3f3] overflow-hidden">
      <aside className="w-[260px] bg-[#4039AD] text-white flex flex-col h-screen fixed left-0 top-0">
        <div className="-pt-3 px-6">
          <img src="/logo.png" className="w-40" />
        </div>

        <nav className="-mt-5 text-sm">
          {/* Dashboard */}
          <div
            onClick={() => {
              setActiveTab("dashboard");
              fetchWorkers();
            }}
            className="px-6 py-3 cursor-pointer hover:bg-white/10 flex items-center gap-3"
          >
            <MdDashboardCustomize className="text-lg" />
            <span>Dashboard</span>
          </div>

          {/* Departments */}
          <div
            onClick={() => {
              setActiveTab("departments");
              fetchDepartments();
            }}
            className="px-6 py-3 cursor-pointer hover:bg-white/10 flex items-center gap-3"
          >
            <Building2 size={18} />
            <span>Departments</span>
          </div>

          {/* Document Types */}
          <div
            onClick={() => {
              setActiveTab("documentTypes");
              fetchDocumentTypes();
            }}
            className="px-6 py-3 cursor-pointer hover:bg-white/10 flex items-center gap-3"
          >
            <GrDocumentUser className="text-lg" />
            <span>Document Types</span>
          </div>

          {/* Healthcare Workers */}
          <div
            onClick={() => {
              setActiveTab("HealthcareWorkers");
              fetchWorkers2();
            }}
            className="px-6 py-3 cursor-pointer hover:bg-white/10 flex items-center gap-3"
          >
            <GrUserWorker className="text-lg" />
            <span>Healthcare Workers</span>
          </div>

          {/* Locations */}
          <div
            onClick={() => {
              setActiveTab("Locations");
              fetchStates();
              fetchCities();
            }}
            className="px-6 py-3 cursor-pointer hover:bg-white/10 flex items-center gap-3"
          >
            <IoLocationOutline className="text-lg" />
            <span>Locations</span>
          </div>

          {/* Designations */}
          <div
            onClick={() => {
              setActiveTab("Designations");
              fetchDesignations();
            }}
            className="px-6 py-3 cursor-pointer hover:bg-white/10 flex items-center gap-3"
          >
            <MdOutlineCastForEducation className="text-lg" />
            <span>Designations</span>
          </div>
        </nav>

        {currentUser && (
          <div className="mx-4 mb-6 bg-white/10 rounded-lg p-4 text-xs mt-auto">
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
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-[260px] px-10 py-8 h-screen overflow-hidden">
        {activeTab === "dashboard" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold">HealthCare Facilities</h1>
              <button
                onClick={() => navigate("/add-facility")}
                className="bg-[#4039AD] text-white px-6 py-2 rounded-lg text-sm"
              >
                +Create Facilities
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* LEFT TABLE */}
              <div className="col-span-12 h-[75vh] flex flex-col overflow-hidden">
                {/* CARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                  <div
                    className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-6 py-3 shrink-0 border-b border-slate-200"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "3fr 2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr",
                    }}
                  >
                    <div>Facility</div>
                    <div>Email</div>
                    <div>Mobile</div>
                    <div>Verification</div>
                    <div>Registered</div>
                    <div>Updated</div>
                    <div className="text-center">Action</div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {loadingWorkers ? (
                      /* 🔥 LOADER SECTION */
                      <div className="flex items-center justify-center py-24">
                        <AdvancedPeopleLoader />
                      </div>
                    ) : workers.length === 0 ? (
                      /* 🔥 EMPTY STATE */
                      <div className="py-16 text-center text-slate-500 font-medium">
                        No workers found
                      </div>
                    ) : (
                      /* 🔥 TABLE DATA */
                      workers.map((item) => (
                        <div
                          key={item._id}
                          className="px-6 py-4 text-sm hover:bg-slate-50 transition"
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "3fr 2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr",
                          }}
                        >
                          {/* Name */}
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.imageUrl}`}
                                  alt={item.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className={`w-full h-full flex items-center justify-center text-xs font-bold ${getAvatarColor(
                                    item.fullName,
                                  )}`}
                                >
                                  {item.fullName?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Name */}
                            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                              {item.fullName}
                            </span>
                          </div>

                          {/* Email */}
                          <div className="text-slate-600 text-sm">
                            <span className="font-semibold font-sans text-slate-800 truncate max-w-[160px] block">
                              {item.email}
                            </span>
                          </div>

                          {/* Mobile */}
                          <div className="text-slate-600 text-sm">
                            {item.mobileNumber}
                          </div>

                          {/* Status */}
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(
                                item.verificationStatus,
                              )}`}
                            >
                              {item.verificationStatus || "Pending"}
                            </span>
                          </div>

                          {/* Created */}
                          <div className="text-slate-600 text-sm">
                            {formatDate(item.createdAt)}
                          </div>

                          {/* Updated */}
                          <div className="text-slate-600 text-sm">
                            {formatDate(item.updatedAt)}
                          </div>

                          {/* Action */}
                          <div className="text-center">
                            <button
                              onClick={() => fetchWorkerDocuments(item)}
                              className="inline-flex items-center justify-center gap-1 px-4 py-1.5 
                       border border-slate-200 rounded text-xs font-semibold 
                       hover:bg-slate-50 transition"
                            >
                              <FaEye className="text-sm" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500 shrink-0 flex items-center justify-between">
                    <div>
                      {workersTotalCount === 0
                        ? 0
                        : (workersPage - 1) * workersLimit + 1}
                      –{Math.min(workersPage * workersLimit, workersTotalCount)}
                      of {workersTotalCount}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={goToPreviousWorkersPage}
                        disabled={workersPage === 1}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 
                   disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                      >
                        Previous
                      </button>

                      <span className="text-xs font-medium">
                        Page {workersPage} of {workersTotalPages || 1}
                      </span>

                      <button
                        onClick={goToNextWorkersPage}
                        disabled={
                          workersPage === workersTotalPages ||
                          workersTotalPages === 0
                        }
                        className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 
                   disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="col-span-5">
                {showDocumentsPanel && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg w-[900px] max-h-[85vh] flex flex-col relative">
                      <div className="p-6 border-b flex-shrink-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-base">
                              Uploaded Documents:
                            </h3>

                            <p className="text-[#4039AD] font-medium mt-1">
                              {selectedWorker?.fullName}
                            </p>

                            <p className="text-sm text-[#4039AD]">
                              {selectedWorkerAddress
                                ? `${selectedWorkerAddress.addressLine1 || ""}, 
               ${selectedWorkerAddress.addressLine2 || ""}, 
               ${selectedWorkerAddress.country || ""} - 
               ${selectedWorkerAddress.postalCode || ""}`
                                : "No Address Found"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                verifyHealthcareWorker(
                                  selectedWorker?._id,
                                  "Verified",
                                )
                              }
                              disabled={verifyingAction !== null}
                              className={`px-5 py-2 rounded-lg text-sm text-white flex items-center gap-2
    ${
      verifyingAction === "Verified"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }
  `}
                            >
                              {verifyingAction === "Verified" && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              )}
                              {verifyingAction === "Verified"
                                ? "Processing..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={() =>
                                verifyHealthcareWorker(
                                  selectedWorker?._id,
                                  "Rejected",
                                )
                              }
                              disabled={verifyingAction !== null}
                              className={`px-5 py-2 rounded-lg text-sm text-white flex items-center gap-2
    ${
      verifyingAction === "Rejected"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
    }
  `}
                            >
                              {verifyingAction === "Rejected" && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              )}
                              {verifyingAction === "Rejected"
                                ? "Processing..."
                                : "Reject"}
                            </button>
                            <button
                              onClick={() => setShowDocumentsPanel(false)}
                              className="text-sm border px-3 py-2 rounded-lg hover:bg-gray-100"
                            >
                              ✕ Close
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 text-xs px-6 py-3 text-gray-500 border-b bg-gray-50 text-center flex-shrink-0">
                        <div>Document</div>
                        <div>Status</div>
                        <div>Expiry</div>
                        <div>Verification</div>
                        <div>Link</div>
                        <div>Verify</div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6">
                        {loadingDocs ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : workerDocuments.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No documents found
                          </p>
                        ) : (
                          workerDocuments.map((doc) => {
                            const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.documentUrl}`;

                            return (
                              <div
                                key={doc._id}
                                className="grid grid-cols-6 items-center border rounded-lg px-3 py-3 text-sm mb-3"
                              >
                                <div>{doc.documentName}</div>

                                <span className="bg-green-100 text-green-700 text-xs px-4 py-1 rounded-full text-center">
                                  Submitted
                                </span>

                                <div className="text-center">
                                  {formatDate(doc.expiryDate)}
                                </div>

                                <span
                                  className={`text-xs px-4 py-1 rounded-full text-center ${getStatusColor(doc.verificationStatus)}`}
                                >
                                  {doc.verificationStatus || "Pending"}
                                </span>

                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#4039AD] underline text-xs text-center"
                                >
                                  View
                                </a>

                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() =>
                                      handleVerify(
                                        doc._id,
                                        "Approved",
                                        null,
                                        doc.documentName,
                                      )
                                    }
                                    disabled={processingDocId === doc._id}
                                    className={`text-white text-xs px-2 py-1 rounded flex items-center gap-1
    ${
      processingDocId === doc._id
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }
  `}
                                  >
                                    {processingDocId === doc._id && (
                                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    )}
                                    {processingDocId === doc._id
                                      ? "Processing..."
                                      : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedDocId(doc._id);
                                      setSelectedDocName(doc.documentName);
                                      setRejectReason("");
                                      setShowRejectModal(true);
                                    }}
                                    disabled={processingDocId === doc._id}
                                    className={`text-white text-xs px-2 py-1 rounded
    ${
      processingDocId === doc._id
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
    }
  `}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "HealthcareWorkers" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold">Healthcare Workers</h1>
            </div>{" "}
            <div className="grid grid-cols-12 gap-6">
              {/* LEFT TABLE */}
              <div className="col-span-12 h-[75vh] flex flex-col overflow-hidden">
                {/* CARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                  <div
                    className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-6 py-3 shrink-0 border-b border-slate-200"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "3fr 2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr",
                    }}
                  >
                    <div>Facility</div>
                    <div>Email</div>
                    <div>Mobile</div>
                    <div>Verification</div>
                    <div>Registered</div>
                    <div>Updated</div>
                    <div className="text-center">Action</div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {loadingHealthcareWorkers ? (
                      <div className="flex items-center justify-center py-24">
                        <AdvancedPeopleLoader />
                      </div>
                    ) : currentHealthcareWorkers.length === 0 ? (
                      <div className="py-16 text-center text-slate-500 font-medium">
                        No healthcare workers found
                      </div>
                    ) : (
                      currentHealthcareWorkers.map((item) => (
                        <div
                          key={item._id}
                          className="px-6 py-4 text-sm hover:bg-slate-50 transition"
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "3fr 2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${item.imageUrl}`}
                                  alt={item.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className={`w-full h-full flex items-center justify-center text-xs font-bold ${getAvatarColor(
                                    item.fullName,
                                  )}`}
                                >
                                  {item.fullName?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Name */}
                            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                              {item.fullName}
                            </span>
                          </div>

                          <div className="text-slate-600 text-sm">
                            <span className="font-semibold font-sans text-slate-800 truncate max-w-[160px] block">
                              {item.email}
                            </span>
                          </div>

                          <div className="text-slate-600 text-sm">
                            {item.mobileNumber}
                          </div>

                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                item.verificationStatus,
                              )}`}
                            >
                              {item.verificationStatus || "Pending"}
                            </span>
                          </div>

                          <div className="text-slate-600 text-sm">
                            {formatDate(item.createdAt)}
                          </div>

                          <div className="text-slate-600 text-sm">
                            {formatDate(item.updatedAt)}
                          </div>

                          <div className="text-center">
                            <button
                              onClick={() => fetchHealthcareWorkerById(item)}
                              className="inline-flex items-center justify-center gap-1 px-4 py-1.5 
              border border-slate-200 rounded text-xs font-semibold 
              hover:bg-slate-50 transition"
                            >
                              <FaEye className="text-sm" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500 shrink-0 flex items-center justify-between">
                    <div>
                      Showing{" "}
                      {workers.length === 0 ? 0 : healthcareFirstIndex + 1}–
                      {Math.min(healthcareLastIndex, workers.length)} of{" "}
                      {workers.length} entries
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={goToPreviousHealthcarePage}
                        disabled={healthcarePage === 1}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 
               disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                      >
                        Previous
                      </button>

                      <span className="text-xs font-medium">
                        Page {healthcarePage} of {healthcareTotalPages || 1}
                      </span>

                      <button
                        onClick={goToNextHealthcarePage}
                        disabled={
                          healthcarePage === healthcareTotalPages ||
                          healthcareTotalPages === 0
                        }
                        className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 
               disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* RIGHT PANEL */}
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
                                ? `http://192.168.0.159:3000/uploads/${workerProfile.imageUrl}`
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

                        <div className="flex items-center gap-4">
                          {/* APPROVE BUTTON */}
                          <button
  onClick={() =>
    verifyHealthcareWorker(workerProfile._id, "Verified")
  }
  disabled={verifyingAction !== null}
  className={`px-4 py-1.5 rounded-lg text-sm text-white flex items-center gap-2
    ${
      verifyingAction === "Verified"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }
  `}
>
  {verifyingAction === "Verified" && (
    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  )}
  {verifyingAction === "Verified" ? "Processing..." : "Approve"}
</button>

                         <button
  onClick={() =>
    verifyHealthcareWorker(workerProfile._id, "Rejected")
  }
  disabled={verifyingAction !== null}
  className={`px-4 py-1.5 rounded-lg text-sm text-white flex items-center gap-2
    ${
      verifyingAction === "Rejected"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600"
    }
  `}
>
  {verifyingAction === "Rejected" && (
    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  )}
  {verifyingAction === "Rejected" ? "Processing..." : "Reject"}
</button>

                          <button
                            onClick={() => {
                              setShowDocumentsPanel(false);
                              setWorkerProfile(null);
                              setActiveProfileTab("personal");
                            }}
                            className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-100 transition"
                          >
                            ✕ Close
                          </button>
                        </div>
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
                          <div className="flex items-center justify-center py-16">
                            <AdvancedPeopleLoader />
                          </div>
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
                                  <p className="font-semibold">
                                    {workerProfile.email}
                                  </p>
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
                                  <p className="text-xs text-gray-500 mb-1">
                                    GENDER
                                  </p>
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
                                  <p className="text-xs text-gray-500 mb-1">
                                    ADDRESS
                                  </p>
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
                                            {
                                              workerProfile.bankData
                                                .accountHolderName
                                            }
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
                                                workerProfile.bankData
                                                  .accountNumber,
                                              )}
                                            </p>

                                            <span
                                              className="cursor-pointer text-gray-400 text-xs"
                                              title="Copy full account number"
                                              onClick={() =>
                                                navigator.clipboard.writeText(
                                                  workerProfile.bankData
                                                    .accountNumber,
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
                                  workerProfile.experiencesData.map(
                                    (exp, i) => (
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
                                    ),
                                  )
                                ) : (
                                  <p className="text-gray-400">
                                    No experience added
                                  </p>
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
                                {workerProfile.qualificationsData?.length >
                                0 ? (
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
                                                {qual.startYear} –{" "}
                                                {qual.endYear}
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
                                {workerDocuments.length === 0 ? (
                                  <p className="text-gray-400 text-sm">
                                    No documents uploaded
                                  </p>
                                ) : (
                                  workerDocuments.map((doc) => {
                                    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.documentUrl}`;

                                    return (
                                      <div
                                        key={doc._id}
                                        className="grid grid-cols-6 items-center border rounded-lg px-4 py-3 text-sm"
                                      >
                                        {/* Document Name */}
                                        <div className="font-semibold text-gray-800">
                                          {doc.documentName}
                                        </div>

                                        {/* Expiry */}
                                        <div>
                                          {doc.expiryDate
                                            ? new Date(
                                                doc.expiryDate,
                                              ).toLocaleDateString()
                                            : "--"}
                                        </div>

                                        {/* Verification */}
                                        <div>
                                          <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                              doc.verificationStatus ===
                                              "Verified"
                                                ? "bg-green-100 text-green-700"
                                                : doc.verificationStatus ===
                                                    "Rejected"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-green-100 text-green-700"
                                            }`}
                                          >
                                            {doc.verificationStatus ||
                                              "Pending"}
                                          </span>
                                        </div>

                                        {/* View */}
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

                                        {/* Approve */}
                                        <div>
                                          <button
                                            onClick={() =>
                                              handleVerify(
                                                doc._id,
                                                "Approved",
                                                null,
                                                doc.documentName,
                                              )
                                            }
                                            className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                                          >
                                            Approve
                                          </button>
                                        </div>

                                        {/* Reject */}
                                        <div>
                                          <button
                                            onClick={() => {
                                              setSelectedDocId(doc._id);
                                              setSelectedDocName(
                                                doc.documentName,
                                              ); // ✅ add this

                                              setRejectReason("");
                                              setShowRejectModal(true);
                                            }}
                                            className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                                          >
                                            Reject
                                          </button>
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
            </div>
          </>
        )}
        {activeTab === "Designations" && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Designations List</h2>

              <button
                onClick={() => setShowAddDesignation(true)}
                className="bg-[#4039AD] text-white px-4 py-2 rounded-lg text-sm"
              >
                + Add Designation
              </button>
            </div>

            {/* Table */}
            <div className="border rounded-xl flex flex-col h-[400px]">
              {/* FIXED HEADER */}
              <div className="bg-gray-50 border-b">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-gray-600">
                      <th className="px-6 py-3 text-left w-[80px]">S.No</th>
                      <th className="px-6 py-3 text-left">Designation Name</th>
                      <th className="px-6 py-3 text-left">Created Date</th>
                      <th className="px-6 py-3 text-left w-[120px]">Status</th>
                      <th className="px-6 py-3 text-left w-[120px]">Action</th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {designations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-6 text-center text-gray-400"
                        >
                          No designations found
                        </td>
                      </tr>
                    ) : (
                      designations.map((item, index) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 w-[80px]">{index + 1}</td>
                          <td className="px-6 py-4 font-medium">
                            {item.designationName}
                          </td>
                          <td className="px-12 py-4">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 w-[120px]">
                            <span
                              className={`px-6 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-12 py-4 w-[120px]">
                            <button
                              onClick={() => {
                                setEditingDesignationId(item._id);
                                setNewDesignation(item.designationName);
                                setDesignationStatus(item.status);
                                setShowAddDesignation(true);
                              }}
                              className="text-blue-600 text-sm hover:underline"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Departments</h2>

              <button
                onClick={() => setShowCreateDept(!showCreateDept)}
                className="bg-[#4039AD] text-white px-4 py-2 rounded-lg"
              >
                + Create Department
              </button>
            </div>

            {showCreateDept && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-10 w-[500px] min-h-[300px] shadow-lg">
                  {/* HEADER */}
                  <h3 className="text-lg font-semibold text-center mb-5 text-[#4039AD]">
                    Create Department
                  </h3>

                  {/* FORM */}
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Department Name"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="border px-3 py-2 rounded col-span-2"
                    />

                    <select
                      value={newDeptStatus ? "active" : "inactive"}
                      onChange={(e) =>
                        setNewDeptStatus(e.target.value === "active")
                      }
                      className="border px-3 py-2 rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAddDepartment}
                      disabled={isCreatingDept}
                      className={`flex-1 py-2 rounded text-white flex items-center justify-center gap-2
    ${isCreatingDept ? "bg-gray-400 cursor-not-allowed" : "bg-[#4039AD]"}
  `}
                    >
                      {isCreatingDept && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {isCreatingDept ? "Adding..." : "Add"}
                    </button>

                    <button
                      onClick={() => setShowCreateDept(false)}
                      className="flex-1 border py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="h-[73vh] flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="bg-gray-50 border-b">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr>
                      <th className="w-1/3 px-6 py-3 text-left font-semibold">
                        Department Name
                      </th>
                      <th className="w-1/6 px-6 py-3 text-left font-semibold">
                        Created At
                      </th>
                      <th className="w-1/6 px-6 py-3 text-left font-semibold">
                        Updated At
                      </th>
                      <th className="w-1/6 px-6 py-3 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm table-fixed">
                  <tbody className="divide-y divide-gray-100">
                    {loadingDepartments ? (
                      <tr>
                        <td colSpan="4">
                          <div className="flex items-center justify-center py-16">
                            <AdvancedPeopleLoader />
                          </div>
                        </td>
                      </tr>
                    ) : currentDepartments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-10 text-gray-400 font-medium"
                        >
                          No departments found
                        </td>
                      </tr>
                    ) : (
                      currentDepartments.map((dept) => (
                        <tr
                          key={dept._id}
                          className="hover:bg-gray-50 align-middle transition"
                        >
                          {/* Department Name */}
                          <td className="w-1/3 px-6 py-3 text-gray-800 font-medium">
                            {dept.departmentName}
                          </td>

                          {/* Created */}
                          <td className="w-1/6 px-8 py-3 text-gray-600">
                            {new Date(dept.createdAt).toLocaleDateString()}
                          </td>

                          {/* Updated */}
                          <td className="w-1/6 px-8 py-3 text-gray-600">
                            {new Date(dept.updatedAt).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="w-1/6 px-6 py-3">
                            <span
                              className={`px-4 py-1 rounded-full text-xs font-semibold ${
                                dept.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {dept.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 text-sm text-gray-600 flex items-center justify-between">
                <div>
                  Showing{" "}
                  {currentDepartments.length === 0
                    ? 0
                    : departmentsIndexOfFirst + 1}
                  –{Math.min(departmentsIndexOfLast, departments.length)} of{" "}
                  {departments.length} department
                  {departments.length !== 1 ? "s" : ""}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousDepartmentsPage}
                    disabled={departmentsPage === 1 || departments.length === 0}
                    className="px-3 py-1 text-xs font-medium rounded border border-gray-300 
             disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-medium">
                    Page {departmentsPage} of {departmentsTotalPages || 1}{" "}
                  </span>

                  <button
                    onClick={goToNextDepartmentsPage}
                    disabled={
                      departmentsPage >= departmentsTotalPages ||
                      departments.length === 0
                    }
                    className="px-3 py-1 text-xs font-medium rounded border border-gray-300 
             disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "documentTypes" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* HEADER */}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Document Types</h2>

              <button
                onClick={() => setShowDocTypeModal(true)}
                className="bg-[#4039AD] text-white px-4 py-2 rounded-lg text-sm"
              >
                + Create Document Type
              </button>
            </div>

            {/* TABLE */}
            {documentTypes.length === 0 ? (
              <p className="text-sm text-gray-500">No document types found</p>
            ) : (
              <div className="h-[75vh] flex flex-col border rounded-lg overflow-hidden">
                <div className="bg-gray-100 border-b">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr>
                        <th className="w-1/2 px-6 py-3 text-left font-semibold">
                          Document Name
                        </th>
                        <th className="w-1/4 px-1 py-3 text-left font-semibold">
                          Expiry Required
                        </th>
                        <th className="w-1/4 px-1 py-3 text-left font-semibold">
                          Created At
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm table-fixed">
                    <tbody className="divide-y divide-gray-100">
                      {currentDocumentTypes.map((doc) => (
                        <tr
                          key={doc._id}
                          className="hover:bg-gray-50 align-middle"
                        >
                          <td className="w-1/2 px-6 py-3 font-medium text-gray-800">
                            {doc.documentName}
                          </td>

                          <td className="w-1/4 px-6 py-3">
                            <div className="flex items-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  doc.isExipreDate
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {doc.isExipreDate ? "Yes" : "No"}
                              </span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="w-1/4 px-6 py-3 text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 border-t px-4 py-2 text-sm text-gray-600 flex items-center justify-between">
                  <div>
                    Showing{" "}
                    {documentTypes.length === 0 ? 0 : indexOfFirstDoc + 1}–
                    {Math.min(indexOfLastDoc, documentTypes.length)} of{" "}
                    {documentTypes.length}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={goToPreviousDocPage}
                      disabled={documentTypesPage === 1}
                      className="px-3 py-1 text-xs border rounded disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-xs font-medium">
                      Page {documentTypesPage} of {documentTypesTotalPages || 1}
                    </span>

                    <button
                      onClick={goToNextDocPage}
                      disabled={
                        documentTypesPage === documentTypesTotalPages ||
                        documentTypesTotalPages === 0
                      }
                      className="px-3 py-1 text-xs border rounded disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "Locations" && (
          <div className="bg-white rounded-xl shadow-sm p-6 h-[85vh] flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Locations</h2>

              <button
                onClick={() => {
                  fetchStates();
                  fetchCities();
                  setLocationTab("state");
                  setSelectedStateId("");
                  setShowCreateStateModal(true);
                }}
                className="bg-[#4039AD] text-white px-4 py-2 rounded-lg text-sm"
              >
                + Create State and City
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left">State</th>
                    <th className="px-4 py-3 text-left">Cities</th>
                  </tr>
                </thead>

                <tbody>
                  {statesList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-4 text-center text-gray-400"
                      >
                        No states found
                      </td>
                    </tr>
                  ) : (
                    statesList.map((state) => {
                      const stateCities = citiesList.filter(
                        (city) =>
                          city.parentId === state._id ||
                          city.parentId?._id === state._id,
                      );

                      return (
                        <tr key={state._id} className="border-t align-top">
                          {/* STATE */}
                          <td className="px-4 py-4 font-semibold text-[#4039AD]">
                            {state.name}
                          </td>

                          {/* CITIES */}
                          <td className="px-4 py-4">
                            {stateCities.length === 0 ? (
                              <span className="text-gray-400 text-sm">
                                No cities
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {stateCities.map((city) => (
                                  <span
                                    key={city._id}
                                    className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs"
                                  >
                                    {city.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {showAddDesignation && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[420px] rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                {editingDesignationId ? "Edit Designation" : "Add Designation"}
              </h3>

              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-1">
                  Designation Name
                </label>
                <input
                  type="text"
                  placeholder="Enter designation name"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="border w-full px-3 py-2 rounded-lg"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-1">
                  Status
                </label>
                <select
                  value={designationStatus}
                  onChange={(e) => setDesignationStatus(e.target.value)}
                  className="border w-full px-3 py-2 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddDesignation(false);
                    setEditingDesignationId(null);
                    setNewDesignation("");
                    setDesignationStatus("Active");
                  }}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveDesignation}
                  className="px-4 py-2 bg-[#4039AD] text-white rounded-lg text-sm"
                >
                  {editingDesignationId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[420px] rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Reject Document
              </h3>

              <label className="text-sm text-gray-600 block mb-2">
                Enter Rejection Reason
              </label>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="border w-full px-3 py-2 rounded-lg mb-4"
                placeholder="Type rejection reason here..."
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!rejectReason.trim()) {
                      notify(false, "Please enter rejection reason");
                      return;
                    }

                    setIsRejecting(true);

                    await handleVerify(
                      selectedDocId,
                      "Rejected",
                      rejectReason,
                      selectedDocName,
                    );

                    setIsRejecting(false);
                    setShowRejectModal(false);
                  }}
                  disabled={isRejecting}
                  className={`px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2
            ${
              isRejecting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }
          `}
                >
                  {isRejecting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {isRejecting ? "Rejecting..." : "Submit & Reject"}
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
                      ? `http://192.168.0.53:3000/uploads/${currentUser.imageUrl}`
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
      {showDocTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[360px] shadow-lg">
            <h3 className="text-center font-semibold text-green-600 mb-4">
              Create Document Type
            </h3>

            <div className="mb-3">
              <label className="text-sm text-gray-600">Document Name</label>
              <input
                type="text"
                value={docTypeName}
                onChange={(e) => setDocTypeName(e.target.value)}
                className="border w-full px-3 py-2 rounded mt-1"
                placeholder="Enter document name"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600">Expiry Required</label>
              <select
                value={docTypeExpiry ? "yes" : "no"}
                onChange={(e) => setDocTypeExpiry(e.target.value === "yes")}
                className="border w-full px-3 py-2 rounded mt-1"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-600">Assigned</label>
              <select
                value={referTo}
                onChange={(e) => setReferTo(Number(e.target.value))}
                className="border w-full px-3 py-2 rounded mt-1"
              >
                <option value={1}>Healthcare Worker</option>
                <option value={2}>Admin</option>
              </select>
            </div>

            <button
              onClick={handleCreateDocumentType}
              disabled={isCreatingDocType}
              className={`w-full py-2 rounded text-white flex items-center justify-center gap-2
    ${isCreatingDocType ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"}
  `}
            >
              {isCreatingDocType && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isCreatingDocType ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={() => setShowDocTypeModal(false)}
              className="w-full bg-red-500 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCreateStateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">
            {/* HEADER */}
            <h3 className="text-center font-semibold text-[#4039AD] mb-4">
              Location Management
            </h3>

            {/* TABS */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setLocationTab("state")}
                className={`flex-1 py-2 text-sm font-semibold ${
                  locationTab === "state"
                    ? "border-b-2 border-[#4039AD] text-[#4039AD]"
                    : "text-gray-500"
                }`}
              >
                Create State
              </button>

              <button
                onClick={() => setLocationTab("city")}
                className={`flex-1 py-2 text-sm font-semibold ${
                  locationTab === "city"
                    ? "border-b-2 border-[#4039AD] text-[#4039AD]"
                    : "text-gray-500"
                }`}
              >
                Create City
              </button>
            </div>

            {locationTab === "city" && (
              <div className="mb-4">
                <label className="text-sm text-gray-600">Select State</label>

                <select
                  value={selectedStateId}
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className="border w-full px-3 py-2 rounded mt-1"
                >
                  <option value="">Select State</option>
                  {statesList.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* NAME INPUT */}
            <div className="mb-4">
              <label className="text-sm text-gray-600">
                {locationTab === "state" ? "State Name" : "City Name"}
              </label>

              <input
                type="text"
                value={locationTab === "state" ? newStateName : newCityName}
                onChange={(e) =>
                  locationTab === "state"
                    ? setNewStateName(e.target.value)
                    : setNewCityName(e.target.value)
                }
                className="border w-full px-3 py-2 rounded mt-1"
                placeholder={
                  locationTab === "state"
                    ? "Enter state name"
                    : "Enter city name"
                }
              />
            </div>

            <button
              onClick={() => {
                if (locationTab === "state") {
                  handleCreateState();
                } else {
                  handleCreateCity();
                }
              }}
              className="w-full bg-[#4039AD] text-white py-2 rounded mb-2"
            >
              {locationTab === "state" ? "Create State" : "Create City"}
            </button>

            {/* CANCEL */}
            <button
              onClick={() => setShowCreateStateModal(false)}
              className="w-full border py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard2;
