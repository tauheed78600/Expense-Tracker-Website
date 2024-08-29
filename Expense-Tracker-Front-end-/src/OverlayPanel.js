// OverlayPanel.js
import React from 'react';
import * as Components from './Components';

const OverlayPanel = ({ signinIn, toggle }) => (
  <Components.OverlayContainer signinIn={signinIn}>
    <Components.Overlay signinIn={signinIn}>
      <Components.LeftOverlayPanel signinIn={signinIn}>
        <Components.Title>Welcome Back!</Components.Title>
        <Components.Paragraph>
          To keep connected with us please login with your personal info
        </Components.Paragraph>
        <Components.GhostButton onClick={() => toggle(true)}>
          Sign In
        </Components.GhostButton>
      </Components.LeftOverlayPanel>
      <Components.RightOverlayPanel signinIn={signinIn}>
        <Components.Title>Expense Tracker!</Components.Title>
        <Components.Paragraph>
          Your one stop solution to track all Expenses.
        </Components.Paragraph>
        <Components.GhostButton onClick={() => toggle(false)}>
          Sign Up
        </Components.GhostButton>
      </Components.RightOverlayPanel>
    </Components.Overlay>
  </Components.OverlayContainer>
);

export default OverlayPanel;
