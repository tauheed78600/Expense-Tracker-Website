// App.js
import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import ReportGenerate from './components/ReportGenerate';
import Navbar from './components/Navbar';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './ForgotPassword';
import axios from 'axios'; // Import axios for making API calls
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import Homepage from './components/Homepage';
import { NotFound } from './components/NotFound';
import Cookies from 'universal-cookie';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expenses, setExpenses] = useState([]); // Add state for expenses
  const cookies = new Cookies();

  useEffect(() => {
    // Check for accessToken in Cookies
    const accessToken = cookies.get('access_token');
    const userId = cookies.get("userId")
    if (accessToken) {
      setIsAuthenticated(true);
      // Fetch expenses for the authenticated user
      const fetchExpenses = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/expenses/${accessToken}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          // console.log("response in report", response.data)
          setExpenses(response.data);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      };
      fetchExpenses();
    } else {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]); // Re-run the effect when isAuthenticated changes

  // console.log('App component currentPage:', currentPage);

  // Call this function after the user logs in
  const handleLoginSuccess = (responseData) => {
    if (!responseData || !responseData.accessToken || !responseData.userId) {
      console.error('Login response data is missing accessToken or userId:', responseData);
      return;
    }
    // console.log('Login successful, responseData:', responseData);
    const userId = responseData.userId;
    // console.log('Login successful, userId:', userId);
    setUserId(userId); // Set userId in the state
    cookies.set('access_token', responseData.accessToken, { path: '/' });
  };

  return (
    <Router>
      <Routes>
      <Route path="*" element={<NotFound />}/>
        <Route path="/" element={cookies.get('access_token') ? (<Navigate to = "/dashboard"/>) : (<Homepage />)} /> {/* Add this line for the homepage route */}
        <Route path="/auth" element={cookies.get('access_token') ? (<Navigate to = "/dashboard"/>):(<Auth onLoginSuccess={handleLoginSuccess} setUserId={setUserId} />)} />
        <Route path="/forgotPassword" element={cookies.get('access_token') ? (<Navigate to = "/dashboard"/>):(<ForgotPassword/>)} />
        <Route path="/reset-password" element={cookies.get('access_token') ? (<Navigate to = "/dashboard"/>):(<ResetPassword/>)} />
        <Route path="/dashboard" element={
          cookies.get('access_token') ? (
            <div className="app-container">
              <Navbar setCurrentPage={setCurrentPage} />
              <main className="grow">
                {currentPage === 'dashboard' && <Dashboard userId={cookies.get("userId")} expenses={expenses} setExpenses={setExpenses} /> }
                {currentPage === 'transactions' && <Transactions userId={cookies.get("userId")}/>}
                {currentPage === 'analytics' && <Analytics userId={cookies.get("userId")} />}
                {currentPage === 'reportgenerate' && <ReportGenerate expenses={expenses}/>}
              </main>
            </div>  
          ) : (
            <Navigate to="/auth" />
          )
        } />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;