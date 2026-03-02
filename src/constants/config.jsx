import "react-toastify/dist/ReactToastify.css";
 
import { toast, Zoom } from "react-toastify";
 
export const baseUrl = import.meta.env.VITE_API_BASE_URL;
export const urls = {
  healthCareWorker: {
    login: "api/healthCareWorker/login",
    signup: "api/healthCareWorker/signup",
  },
  documentType: {
    getAll: "api/documentType/getAll",
  },
  shift: {
    create: "api/shift/create",
    getAll: "api/shift/getAll",
  },
  document: {
    upload: "api/document/upload",
    getAll: "api/document/getAll",
    verify: "api/document/verify",
  },
};
export const notify = (status, msg) => {
  const toastOptions = {
    position: "top-center", // Set the position to bottom-right
    autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
    hideProgressBar: false, // Show the progress bar
    closeOnClick: true, // Close the toast when clicked
    pauseOnHover: true, // Pause the timer when hovering
    draggable: true, // Make the toast draggable
    progress: undefined, // Use the default progress bar
    // transition: Flip,
    theme: "dark",
    transition: Zoom,
    style: {
      width: "300px", // Adjust width as needed
    },
  };
  if (status == true) {
    toast.success(msg, toastOptions);
  } else {
    toast.error(msg, toastOptions);
  }
};

export const  colors={
success:"#fff"
}