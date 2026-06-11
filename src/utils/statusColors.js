

export const getStatusColor = (status = "") => {
  const value = status.toLowerCase();

 
  if (["approved", "verified", "active", "success"].includes(value)) {
    return "bg-green-100 text-green-700";
  }

  
  if (["rejected", "failed", "error", "inactive"].includes(value)) {
    return "bg-red-100 text-red-700";
  }

  
  if (["pending", "under review", "processing"].includes(value)) {
    return "bg-yellow-100 text-yellow-700";
  }

  
  return "bg-indigo-100 text-indigo-700";
};