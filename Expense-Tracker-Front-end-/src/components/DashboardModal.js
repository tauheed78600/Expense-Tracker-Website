import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PopupModal from './PopupModal';

function DashboardModal({state, setState, userData, setUserData}) {
  const [show, setShow] = useState(false);
  const cookies = new Cookies();
  const [emailError, setEmailError] = useState('');
  const [popupState, setPopupState] = useState('')

  const masterContent = {
    "updated": {
        "head": "Success",
        "body": "Details Updated!"
    },
    "usernameError": {
        "head": "Error",
        "body": "Username already exists!"
    },
    "emailExists":{
        "head": "Error",
        "body": "Email address is linked to another user!"
    },
    "error": {
      "head":"Error",
      "body":"Could not update data!"
    },
    "usernameInvalid": {
      "head":"Error",
      "body":"Username invalid!"
    },
    "emailInvalid": {
      "head":"Error",
      "body":"Email invalid!"
    }
  }

  const [content, setContent] = useState(masterContent["error"])

  

  const handleClose = () =>{
    setState(false);
    setShow(false);
  } 
  // const handleShow = () => setShow(true);
const [newUsername, setNewUsername] = useState('');
const [newEmail, setNewEmail] = useState('');
const [email, setEmail] = useState('');
const [currentEmail, setCurrentEmail] = useState('');
const [currentUsername, setCurrentUsername] = useState('');


const accessToken = cookies.get("access_token")

useEffect(()=>{
  setNewUsername(userData.user_name);
  setCurrentUsername(userData.user_name);
  setNewEmail(userData.email)
  setCurrentEmail(userData.email);
    
},[state])

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const handleUpdate = async () => {
    var tempData = userData;
    // console.log(emailRegex.test(newEmail));
    if(!emailRegex.test(newEmail))
    {
      setContent(masterContent["emailInvalid"]);
      setPopupState(true);
      return;
    }
    if(newUsername.trim().length === 0 || newUsername.includes(' '))
    {
      setContent(masterContent["usernameInvalid"]);
      setPopupState(true);
      return
    }
    else if(newUsername !== currentUsername)
    {
      const updateUserEndpointURL = `http://localhost:3000/total/updateUsername/?token=${encodeURIComponent(cookies.get('access_token'))}&username=${encodeURIComponent(newUsername)}`;
      // console.log("inside first condition")
          try {
          const response = await axios.put(updateUserEndpointURL, {}, {
              headers: {
                Authorization: `Bearer ${cookies.get('access_token')}`,
              },
          });
          // console.log("response in 1st condition", response.data)
          // console.log(response.data);
          console.log(response)
          if (response.data.status===200) {
            tempData = {...tempData, "user_name": newUsername};
            setCurrentUsername(newUsername);
            setContent(masterContent["updated"]);
            setPopupState(true);
            
          } else {
            setContent(masterContent["usernameError"]);
            setPopupState(true);
            return;
          }
        } catch (error) {
          console.error('Error updating user data:', error);
          setContent(masterContent["error"]);
          setPopupState(true)
        } 
      };
      if (newEmail !== currentEmail) {
        const updateUserEndpointURL = `http://localhost:3000/total/updateEmail/?token=${encodeURIComponent(cookies.get('access_token'))}&email=${encodeURIComponent(newEmail)}`;
        // console.log("inside second condition")
            try {
            const response = await axios.put(updateUserEndpointURL, {}, {
                headers: {
                  Authorization: `Bearer ${cookies.get('access_token')}`,
                },
            });
            // console.log("response in 2nd condition", response)
        
            if (response.data.status===200) {
              tempData = {...tempData, "email": newEmail};
              setCurrentEmail(newEmail);
              setContent(masterContent["updated"]);
              setPopupState(true)
            } else {
              setContent(masterContent["emailExists"]);
                setPopupState(true)
            }
          } catch (error) {
            setContent(masterContent["error"]);
            setPopupState(true)
          } 
        };
        setUserData(tempData);

  
} 

const handlePopupState = (state) => {
  setPopupState(state);
}
  useEffect(()=>{
    setShow(state);
  }, [state]);

  return (
    <>
    <Modal backdrop="static" keyboard={false} show={show} onHide={handleClose} animation={false} centered>
    <PopupModal state={popupState} setState={handlePopupState} content={content}/>
        <Modal.Header closeButton>
          <Modal.Title><h2>Update User Information</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label sm={4} htmlFor="username">Username:</Form.Label>
              <Col sm={8}>
                <Form.Control type="text" id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              </Col>
            
            </Form.Group>
              
            <Form.Group as={Row} className="mb-3">
              <Form.Label sm={4} htmlFor="email">Email:</Form.Label>
              <Col sm={8}>
                <Form.Control type="email" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </Col>
            </Form.Group>
          </Form>
          <div>
          
          
          </div>
        </Modal.Body>
        <Modal.Footer>
        
          <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={()=>{handleUpdate()}}>
          Update
          </Button>
          <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleClose}>
          Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}



export default DashboardModal;
