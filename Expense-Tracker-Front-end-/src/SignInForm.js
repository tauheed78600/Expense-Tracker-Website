// SignInForm.js
import React, { useContext, useState, useRef, useEffect } from 'react';
import * as Components from './Components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { AuthContext } from './AuthContext';
import SpinnerComponent from './components/SpinnerComponent';
import PopupModal from './components/PopupModal';
import ReCAPTCHA from "react-google-recaptcha";
import "./styles/SignInForm.css";
import Cookies from 'universal-cookie';
 
const SignInForm = ({ onLoginSuccess }) => {
  const cookies = new Cookies();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const [formValid, setFormValid] = useState(false);

  const masterContent = {
    "loginError": {
      "head":"Error",
      "body":"Invalid login credentials!"
    },
    "captchaError": {
      "head":"Error",
      "body":"Please verify CAPTCHA!"
    },
    "detailError": {
      "head":"Error",
      "body":"Please fill the required fields correctly!"
    },
    "serverError": {
      "head":"Error",
      "body":"Could not reach server!"
    }
  }
  const [popupState, setPopupState] = useState(false);
  const [content, setContent] = useState(masterContent["serverError"]);
  const handlePopupState = (state) => {
    setPopupState(state);
}

const validForm = () => {
  let isValid = true;

  if (username.trim().length === 0) {
    isValid = false;
  }
  if (password.length < 8) {
    isValid = false;
  }
  
  return isValid;
};
 
  const validateForm = () => {
    let isValid = true;
 
    if (username.trim().length === 0) {
      setUsernameError('Username is required');
      isValid = false;
    } else {
      setUsernameError('');
    }
 
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  useEffect(()=>{
    if(validForm())
    {
      setFormValid(true);
      setUsernameError('');
      setPasswordError('');
    }
      
  },[username, password])
 
  const validateEmail = () => {
    let isValid = true;
 
    if (!email.includes('@')) {
      setEmailError('Invalid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
 
    return isValid;
  };

  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();
    var token = null;
    try{
      token = captchaRef.current.getValue();
    }
    catch(error)
    {
      if(validForm())
        token = true;
    }
    
    if (validateForm()) {
      if(!token)
      {
          setContent(masterContent["captchaError"]);
          setPopupState(true);
      }
      else
      {try {
        setLoading(true);
        // Append email and password as query parameters to the URL
        await axios.post(`https://expense-tracker-website-8.onrender.com/total/login/?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`).
        then((response)=>{
          login();
          // console.log('Login API response:', response.data);
          cookies.set('access_token', response.data.accessToken, { path: '/' });
          localStorage.setItem("lastMonthNineReachedEmailSent", 0)
          localStorage.setItem("remaininingBudgetZero", 0)
          // console.log(response)
          const userId = response.data.userId;
          // console.log("response.data.userId",response.data.userId);
          setLoading(false);
          onLoginSuccess(response.data); 
          navigate('/dashboard');
        }).
        catch((error)=>{
          // console.log(error);
          setContent(masterContent["loginError"]);
          setPopupState(true);
          setLoading(false);
        });
        
      } catch (error) {
        // Handle errors (e.g., show error message)
        console.log(error);
        setContent(masterContent["serverError"]);
        setPopupState(true);
        setLoading(false);
      }}
    }
    else{
      setContent(masterContent["detailError"]);
      setPopupState(true);
    }
    try{
      captchaRef.current.reset();
    }
    catch(error)
    {
      captchaRef = null;
    }
  };
 
 
  const toggleForgotPasswordModal = () => {
    navigate("/forgotPassword")
  };
 
  return (
    <>
    <SpinnerComponent state={loading} setState={setLoading}/>
    <PopupModal state={popupState} setState={handlePopupState} content={content}/>
      <Components.Form onSubmit={handleSubmit}>
        <Components.Title1 id ="signin-title">Sign In</Components.Title1>
        <Components.Input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id="signin-input"
        />
        {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>}
        <Components.Input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="signin-input"
          style={{"marginBottom":"20px"}}
        />
        {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
        {formValid === true &&(<ReCAPTCHA sitekey={process.env.REACT_APP_SITE_KEY} ref={captchaRef}/>)}
            
        <div style={{"display":"flex", "gap":"5px"}}>
              <Components.Button type='submit' id="button-signin">
                Sign In</Components.Button>
              <Components.Button type='button' id="button-forgot" onClick={toggleForgotPasswordModal}
              >
                Forgot your password?
              </Components.Button>
        </div>
        
          
      </Components.Form>
    </>
  );
};
 
export default SignInForm;