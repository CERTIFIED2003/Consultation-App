import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "./pages/HomePage";
import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./assets/Loader.jsx";

function App() {
  const [loginUser, setLoginUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadServer() {
    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api`);
      setIsLoading(false);
    } catch (err) {
      window.location.reload();
    }
  };

  useEffect(() => {
    loadServer();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isLoading
            ? <Loader />
            : <HomePage loginUser={loginUser} setLoginUser={setLoginUser} />
        } />
      </Routes>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App
