// Auth.js
import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import * as Components from './Components';
import Cookies from 'universal-cookie';

const Auth = ({ setCurrentPage, setUserId }) => {
  const cookies = new Cookies();
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const handleLoginSuccess = (responseData) => {
    if (!responseData || !responseData.userId) {
      console.error('Login response data is missing userId:', responseData);
      return;
    }
    // console.log('Login successful, responseData:', responseData);
    const userId = responseData.userId;
    // console.log('Login successful, userId:', userId);
    cookies.set('userId', userId, { path: '/' });
    setUserId(userId); // Set userId in the state
  };

  return (
    <Components.Container style={{"display":"flex","alignItems":"center", "justifyContent":"center",
    "top":"0", "bottom":"0", "left":"0", "right":"0"}}>
      {isSignUp ? (
        <>
          <Components.SignUpContainer>
            <SignUpForm toggleForm={toggleForm} />
          </Components.SignUpContainer>
          <Components.OverlayContainer>
            <Components.Overlay />
            <Components.OverlayPanel>
              <Components.Title>Already have an account?</Components.Title>
              <Components.Button onClick={toggleForm} style={{"width":"150px", "marginLeft":"150px"}}>Sign In</Components.Button>
            </Components.OverlayPanel>
          </Components.OverlayContainer>
        </>
      ) : (
        <>
          <Components.SignInContainer>
            <SignInForm toggleForm={toggleForm} setCurrentPage={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
          </Components.SignInContainer>
          <Components.OverlayContainer>
            <Components.Overlay />
            <Components.OverlayPanel>
              <Components.Title>Don't have an account?</Components.Title>
              <Components.Button onClick={toggleForm} style={{"width":"150px", "marginLeft":"150px"}}>Sign Up</Components.Button>
            </Components.OverlayPanel>
          </Components.OverlayContainer>
        </>
      )}
    </Components.Container>
  );
};

export default Auth;
