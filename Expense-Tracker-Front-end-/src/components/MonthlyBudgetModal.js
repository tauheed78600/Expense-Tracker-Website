import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import axios from 'axios';
import PopupModal from './PopupModal';
import SpinnerComponent from "./SpinnerComponent";
import Cookies from 'universal-cookie';

function MonthlyBudgetModal() {
  const [show, setShow] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const cookies = new Cookies();

  //set current, remaining budget on loading
  useEffect(() => {
    const fetchUserData = async () => {
      
        const userId = cookies.get('userId');
        const accessToken = cookies.get('access_token');
        try {
          setLoading(true);
            const response = await axios.get(`https://expense-tracker-website-8.onrender.com/total/${accessToken}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            setLoading(false);
            if(response.data.monthly_budget !== undefined)
            {
              setCurrentBudget(response.data.monthly_budget);
              setNewBudget(response.data.monthly_budget);
            }
                
            else
                setCurrentBudget(0);
            if(response.data.remaining_budget !== undefined)
                setRemainingBudget(response.data.remaining_budget);
            else
                setRemainingBudget(0);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    
    fetchUserData();
}, [show]);

  const [newBudget, setNewBudget ] = useState(0);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //store new budget on input change
  const handleBudgetChange = (e) => {
    setNewBudget(e.target.value);
  }

  const [popupState, setPopupState] = useState(false);
    const handlePopupState = (state) => {
        setPopupState(state);
    }

    

    const masterContent = {
      "updateSuccess": {
          "head": "Success",
          "body": "Budget updated successfully!",
        },

        "error": {
          "head": "Error",
          "body": "Could not update Budget!"
      },
      "numberError": {
        "head":"Error",
        "body":"New Budget is not a number!"
      },
      "negativeError": {
        "head":"Error",
        "body":"New Budget cannot be negative!"
      },
      "lessThanExpense": {
        "head":"Error",
        "body":"New Budget cannot be less than total expense!"
      },
      "emptyError": {
        "head":"Error",
        "body":"Please enter a New Budget!"
      },
      "sameBudgetError": {
        "head":"Error",
        "body":"New Budget cannot be same as current Budget!"
      },

  }

  const [content, setContent] = useState(masterContent["error"]);



  const accessToken = cookies.get('access_token');

  //submit budget change request to server
  const handleSave = async () => {
        if(newBudget === "")
        {
          setContent(masterContent["emptyError"]);
          setPopupState(true);
        }
        else if(isNaN(newBudget))
        {
          setContent(masterContent["numberError"]);
          setPopupState(true);
        }
        else if(newBudget < 0)
        {
          setContent(masterContent["negativeError"]);
          setPopupState(true);
        }
        else if(newBudget === currentBudget)
        {
          setContent(masterContent["sameBudgetError"]);
          setPopupState(true);
        }
        else if(newBudget < (currentBudget-remainingBudget))
        {
          setContent(masterContent["lessThanExpense"]);
          setPopupState(true);
        }
        else {
          const userId = cookies.get('userId');
          
          try {
            setLoading(true); 
            const response = await axios.put(`https://expense-tracker-website-8.onrender.com/expenses/budget-goal?monthly_budget=${newBudget}&token=${accessToken}`, {}, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            setLoading(false);


              if (response.status===200)
              {
                  setContent(masterContent["updateSuccess"]);
                  setPopupState(true);
                  // console.log("Budget goal set successfully:", response.data);
                  setCurrentBudget(newBudget);
              setRemainingBudget(newBudget-currentBudget+remainingBudget);
              }
              // Update the displayed budget goal state
              
          } catch (error) {
            setContent(masterContent["error"]);
            setPopupState(true);
            console.error('Error setting budget goal:', error);
          }
        }
        
      };

  

  return (
    <>
    <SpinnerComponent state={loading} setState={setLoading}/>
      <Button variant="primary" onClick={handleShow}>
        Set Budget
      </Button>
      <PopupModal state={popupState} setState={handlePopupState} content={content}/>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Set Budget</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form style={{"marginRight":"-150px"}}>
            <Form.Group as={Row} className="mb-3" controlId="formBudget">
                <Form.Label column sm={4}>
                    Current Budget: {currentBudget}
                </Form.Label>
                
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formBudget">
            <Form.Label column sm={4}>
                    Remaining Budget: {remainingBudget}
                </Form.Label>
                
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formBudgetInput">
                <Col sm={10}>
                <Form.Control name = "monthlyBudget" placeholder="" value={newBudget} onChange={(e)=>{handleBudgetChange(e)}}/>
                </Col>
                <Form.Label id = "monthly-budget-error" column sm={2}>
                </Form.Label>
            </Form.Group>
        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button style={{"backgroundColor":"#e26f6f"}} variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MonthlyBudgetModal;