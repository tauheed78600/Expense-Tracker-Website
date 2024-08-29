// ForgotPassword.js
import React, { useState, useEffect, useRef } from "react";
import * as Components from "./Components";
import axios from "axios"; // Import Axios
import PopupModal from "./components/PopupModal";
import SpinnerComponent from "./components/SpinnerComponent";
import ReCAPTCHA from "react-google-recaptcha";
import "./styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [popupState, setPopupState] = useState(false);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const [formValid, setFormValid] = useState(false);

  const handlePopupState = (state) => {
    setPopupState(state);
  };
  const masterContent = {
    "success": {
      head: "Success",
      body: "Check your E-mail for verification Link",
    },
    "error": {
      head: "Error",
      body: "Could not send E-mail",
    },
    "notValidEmail": {
      head: "Error",
      body: "Not a valid E-mail",
    },
    "captchaError": {
      "head":"Error",
      "body":"Please verify CAPTCHA!"
    },
  };

  const [content, setContent] = useState(masterContent["error"]);

  function validEmail(value) {
    var re = /\S+@\S+\.\S+/;
    if (re.test(value)) {
      return true;
    } else {
      return false;
    }
  }

  useEffect(()=>{
    if(validEmail(email))
    {
      setFormValid(true);
    }
  },[email])

  const checkEmail = (value) => {
    var element = document.getElementById("forgot-password-email");
    setEmail(value);
    if (validEmail(value)) {
      element.innerHTML = "";
    } else {
      element.innerHTML = "Not a valid E-Mail!";
    }
  };

  // Function to handle the form submission
  const handleSubmit = async (event) => {
    var token = null;
    try{
      token = captchaRef.current.getValue();
    }
    catch(error)
    {
      if(validEmail())
        token = true;
    }
    event.preventDefault();
    if (!validEmail(email)) {
      setContent(masterContent["notValidEmail"]);
      setPopupState(true);
    } else {
      if(!token)
      {
          setContent(masterContent["captchaError"]);
          setPopupState(true);
      }
      else
      {
        try {
          setLoading(true);
          // const response = await axios.post(`http://localhost:3000/total/forgotPassword/?email=${encodeURIComponent(email)}`);
          const response = await axios.post(
            "http://localhost:3000/total/forgotPassword",
            { email },
            { headers: { "Content-Type": "application/json" } }
          );
          if (response) {
            setContent(masterContent["success"]);
            setPopupState(true);
            setLoading(false);
          }
        } catch (error) {
          setContent(masterContent["error"]);
          setPopupState(true);
          setLoading(false);
        }
      }
    }
    try{
      captchaRef.current.reset();
    }
    catch(error)
    {
      captchaRef = null;
    }
  };

  return (
    <>
      <SpinnerComponent state={loading} setState={setLoading} />
      <PopupModal
        state={popupState}
        setState={handlePopupState}
        content={content}
      />
      <Components.Form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        style={{
          display: "flex",
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          top: "0",
          bottom: "0",
          left: "0",
          right: "0",
        }}
      >
        <Components.Title id="forgot-title">
          Forgot Password?
        </Components.Title>
        <Components.Input
          placeholder="Enter your E-mail address"
          value={email}
          onChange={(e) => {setEmail(e.target.value);checkEmail(e.target.value)}}
          style={{ width: "50%" }}
        />
        <label id="forgot-password-email"></label>
        {formValid === true &&(<ReCAPTCHA sitekey={process.env.REACT_APP_SITE_KEY} ref={captchaRef}/>)}
        <Components.Button type="submit">Send Link</Components.Button>
      </Components.Form>
    </>
  );
};

export default ForgotPassword;
