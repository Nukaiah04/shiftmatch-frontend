import "react-toastify/dist/ReactToastify.css";
 
import { toast, Zoom } from "react-toastify";
 
export const baseUrl="http://192.168.0.76:3000/api"

export const urls={
  healthCareWorker:  {
        login:"healthCareWorker/login",
       signup :"healthCareWorker/signup"
    },
    documentType:{
        getAll:"documentType/getAll"
    },
    shift:{
        create:"shift/create",
        getAll:"shift/getAll"
    },
    document:{
        upload:"document/upload",
        getAll:"document/getAll",
        verify:"document/verify",
    }
}
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