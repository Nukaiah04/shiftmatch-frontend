import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Authentication.jsx/Login";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import AddFacility from "./pages/AddFacility";
import { ToastContainer } from "react-toastify";




const App = () => {
  return (
    <BrowserRouter> 
     <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard2" element={<Dashboard2 />} />
        <Route path="/add-facility" element={<AddFacility />} />
        <Route path="/login" element={<Login />} />



      </Routes>
    </BrowserRouter>
  );
};

export default App;
