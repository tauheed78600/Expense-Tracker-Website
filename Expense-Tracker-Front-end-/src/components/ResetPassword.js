// ForgotPassword.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Components from '../Components';
import axios from 'axios'; // Import Axios
import {  useLocation, useNavigate } from 'react-router-dom';
import PopupModal from './PopupModal';
import SpinnerComponent from './SpinnerComponent';
import "../styles/ResetPassword.css";


const ResetPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [popupState, setPopupState] = useState(false);
    const timerId = useRef(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePopupState = (state) => {
        setPopupState(state);
    }
    const masterContent = {
        "resetSuccess":  {
            "head": "Success",
            "body": "Password reset successfully"
        },
      "resetError": {
        "head": "Error",
        "body": "Could not change password"
      },
      "passwordError": {
        "head": "Error",
        "body": "Password does not match rules!"
      },
      "passwordNotMatch": {
        "head": "Error",
        "body": "Passwords do not match!"
      }
    }

    const [content,setContent] = useState(masterContent["resetError"]);

    //to check if password is valid
    function validPassword(value) {
      if(value.length === 0)
        return false;
      else if(value.length < 8)
        return false;
        else if (!/[A-Z]/.test(value)) {
          return false;
      } else if (!/[!@#\$%\^&\*_]/.test(value)) {
        return false;
      }
      else if (!/\d/.test(value)) {
        return false;
    }
      else
        return true;
    }

    //show password validation errors
    function checkPassword(value) {
      var element = document.getElementById("reset-password-error");
      setNewPassword(value);
      if(value.length === 0)
      {
        element.innerHTML = "Password cannot be empty!";
      }
      else if(value.length < 8)
      {
        element.innerHTML = "Password needs to be at least 8 characters long!";
      }
      else if (!/[A-Z]/.test(value)) {
        element.innerHTML = 'Password must contain at least one uppercase character';
    } else if (!/[!@#\$%\^&\*_]/.test(value)) {
      element.innerHTML ='Password must contain at least one special character';
    }
    else if (!/\d/.test(value)) {
      element.innerHTML ='Password must contain at least one number';
  }
      else if(confirmNewPassword !== "" && value !== confirmNewPassword)
      {
        element.innerHTML = "Passwords do not match!";
      }
      else
      {
        element.innerHTML = "";
        document.getElementById("confirm-reset-password-error").innerHTML = "";
      }
    }

    //show confirm password validation errors
    function checkConfirmPassword(value) {
      var element = document.getElementById("confirm-reset-password-error");
      setConfirmNewPassword(value);
      if(value.length === 0)
      {
        element.innerHTML = "Password cannot be empty!";
      }
      else if(value.length < 8)
      {
        element.innerHTML = "Password needs to be at least 8 characters long!";
      }
      else if (!/[A-Z]/.test(value)) {
        element.innerHTML = 'Password must contain at least one uppercase character';
    } else if (!/[!@#\$%\^&\*_]/.test(value)) {
      element.innerHTML ='Password must contain at least one special character';
    }
    else if (!/\d/.test(value)) {
      element.innerHTML ='Password must contain at least one number';
  }
      else if(value !== newPassword)
      {
        element.innerHTML = "Passwords do not match!";
      }
      else
      {
        element.innerHTML = "";
        document.getElementById("reset-password-error").innerHTML = "";
      }
    }

    //to navigate to /auth
    const gotoAuth = useCallback(() => {
      navigate("/auth");
    }, [navigate]);


    //set timer for 3 seconds on successful password reset and goto auth page
    useEffect(() => {
      if (content.head === "Success") {
          timerId.current = setTimeout(() => {
              setPopupState(false);
              gotoAuth();
          }, 3000);
      }

      return () => {
          //Clearing a timeout
          clearTimeout(timerId.current);
      };
  }, [content, gotoAuth]);

  // Function to handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if(!validPassword(newPassword))
    {
      setContent(masterContent["passwordError"]);
      setPopupState(true);
    }
    else if(newPassword !== confirmNewPassword)
    {
      setContent(masterContent["passwordNotMatch"]);
      setPopupState(true);
    }
    else
    {
      try {
        setLoading(true);
          // const response = await axios.post(`http://localhost:3000/total/forgotPassword/?email=${encodeURIComponent(email)}`);
          const response = await axios.post(
              'http://localhost:3000/total/resetPassword',
              { 
                  "token": token,
                  "password": newPassword
              },
              { headers: { 'Content-Type': 'application/json'
          } }
          );
          setLoading(false);
          if (response)
          {
              setContent(masterContent["resetSuccess"])
              setPopupState(true);
          }
      } catch (error) {
          setLoading(false);
          setContent(masterContent["resetError"])
          setPopupState(true);
      }
    }
};

  return (
    <>
    <PopupModal state={popupState} setState={handlePopupState} content={content}/>
    <SpinnerComponent state={loading} setState={setLoading}/>
    <Components.Form onSubmit={(e)=>{handleSubmit(e)}}
    style = {{"display":"flex", "position":"absolute" ,"alignItems":"center", "justifyContent":"center",
    "top":"0", "bottom":"0", "left":"0", "right":"0"}}>
      <Components.Title id = "reset-title">Reset Password</Components.Title>
      <Components.Input
        type='password'
        placeholder='Enter new password'
        value={newPassword}
        onChange={(e) => checkPassword(e.target.value)}
        style = {{"width":"50%"}}
      />
      <label id="reset-password-error"></label>
      <Components.Input
        type='password'
        placeholder='Confirm new password'
        value={confirmNewPassword}
        onChange={(e) => checkConfirmPassword(e.target.value)}
        style = {{"width":"50%"}}
      />
      <label id="confirm-reset-password-error"></label>
      <Components.Button type='submit'>Change Password</Components.Button>
    </Components.Form>
    </>
    
  );
};

export default ResetPassword;
