import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css'; 
import 'material-icons/iconfont/material-icons.css';
import Cookies from 'universal-cookie';
import DashboardModal from "./DashboardModal.js";

const Dashboard = ({ userId }) => {
  const cookies = new Cookies();

  const masterContent = {
    "fetchError":{
        "head": "Error",
        "body": "Could not fetch data"
    }

};

const [popupState, setPopupState] = useState(false);

const [content, setContent] = useState(masterContent["fetchError"]);
const [userData, setUserData] = useState({});
const [newUsername, setNewUsername] = useState('');
const [newEmail, setNewEmail] = useState('');
const [showUpdateModal, setShowUpdateModal] = useState(false);

const [showDashboard, setShowDashboard] = useState(false);

//load user data
useEffect(() => {
const accessToken = cookies.get('access_token');
// console.log("accessToke indashboard", accessToken)
const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/total/getUser/${accessToken}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        });
        console.log(response.data);                                                                                                 
    // console.log("response.data", response.data)
    // console.log("userId in dashboard", userId)
    setUserData(response.data);                                                                                                                                                                                             
    } catch (error) {
    setContent(masterContent["fetchError"]);                                                                                                                                                                                                                                                                              
    setPopupState(true);
    }
};

const handleUpdateModal= () => {
  
}


fetchData();
}, [userId]);

const handleUpdate = async () => {
  const updateUserEndpoint = `http://localhost:3000/total/updateUser/${userId}`;
 
  try {
     const response = await axios.put(updateUserEndpoint, {
       username: newUsername,
       email: newEmail,
     }, {
       headers: {
         Authorization: `Bearer ${cookies.get('access_token')}`, // Use backticks for template literals
       },
     });
 
     if (response.data) {
       setUserData(response.data);
       setShowUpdateModal(false);
     } else {
       console.error('Failed to update user data');
     }
  } catch (error) {
     console.error('Error updating user data:', error);
  }
 };
  // Implement your update logic here. For example, you might make an API call to update the user data.
  const showDashboardWithAnimation = () => {
    setShowDashboard(true);
 };
return (

  <div className="container">
    <DashboardModal
     state={showUpdateModal} 
     setState = {setShowUpdateModal} 
     userData={userData}
     setUserData={setUserData}
    />
    <div className='h1'>
    <h1 className="userDash" style={{ marginBottom: '10' }}>User Dashboard</h1>
    {/*<div className="section" id="name-section">
    <label htmlFor="name">UserName:</label>
    <div className='h1'>
<div className="userDash" style={{ marginBottom: '10' }}>User Dashboard*/}
 <button className="edit-btn" onClick={() => setShowUpdateModal(true)}>🖉</button>
  </div>
  {/*<div className={`modal-animation-wrapper ${showUpdateModal ? 'show' : ''}`}>*/}
  

 
 <div className="section" id="name-section">
  <label htmlFor="name">UserName:</label> 
  <div id="name" className="info">{userData.user_name || 'Loading...'}</div>
    <span className="material-icons-outlined text-green">accessibility</span>
    </div>
    <div className="section" id="budget-section">
    <label htmlFor="monthly_budget">Monthly Budget:</label>
    <div id="monthly_budget" className="info">{userData.monthly_budget || 'Loading...'}</div>
    <span className="material-icons-outlined text-green">add_shopping_cart</span>
    </div>
    <div className="section" id="username-section">
    <label htmlFor="user_name">Remaining Budget:</label>
    <div id="user_name" className="info">{userData.remaining_budget || '0'}</div>
    <span className="material-icons-outlined text-green">add_shopping_cart</span>
    </div>
    <div className="section" id="email-section">
    <label htmlFor="email">Email:</label>
    <div id="email" className="info">{userData.email || 'Loading...'}</div>
    <span className="material-icons-outlined text-green">mail</span>
    </div>
</div>
);
};

export default Dashboard;