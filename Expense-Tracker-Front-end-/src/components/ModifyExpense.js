import "../styles/ModifyExpense.css";
import { useState, useEffect, fetchData } from "react";
import axios from "axios";
import { currentDate } from "./currentDate";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getCategories } from "./categories";
import { Plus } from "lucide-react";
import PopupModal from "./PopupModal";
import SpinnerComponent from "./SpinnerComponent";
import Cookies from "universal-cookie";


export default function ModifyExpense({ onAddExpense, onEditExpense, loadExpense, setLoadExpense, show, setShow})
{
    const cookies = new Cookies();
    const [loading, setLoading] = useState(false);
    const errorMessage = {
        date: "modify-expense-date-error",
        category: "modify-expense-category-error",
        merchant: "modify-expense-merchant-error",
        amount:  "modify-expense-amount-error",
        paymentMode: "modify-expense-payment-error"
    };
    var categories = getCategories();
    const [popupState, setPopupState] = useState(false);
    const [modifyExpenseData, setModifyExpenseData] = useState(
        {
            index: "",
            userId: "",
            expenseId: "",
            date: "",
            category: "",
            merchant: "",
            amount:  "",
            paymentMode: ""
        }
    )
    //set data when loadExpense changes
    useEffect(() => {
        if (Object.keys(loadExpense).length ===  0)
        {
            setModifyExpenseData({
                index: "",
                userId: "",
                expenseId: "",
                date: "",
                category: "",
                merchant: "",
                amount: "",
                paymentMode: ""
            })
        }
        else if(loadExpense.index !== modifyExpenseData.index
         || loadExpense.expenseId !== modifyExpenseData.expenseId
        ||loadExpense.date !== modifyExpenseData.date
        ||loadExpense.category !== modifyExpenseData.category
        ||loadExpense.merchant !== modifyExpenseData.merchant
        ||loadExpense.amount !== modifyExpenseData.amount
        ||loadExpense.paymentMode !== modifyExpenseData.paymentMode)
        {
            
            setModifyExpenseData({
                "index": loadExpense.index,
                "expenseId": loadExpense.expenseId,
                "date": loadExpense.date,
                "category": loadExpense.category,
                "merchant": loadExpense.merchant,
                "amount": loadExpense.amount,
                "paymentMode": loadExpense.paymentMode
            })
        }
        // console.log(loadExpense);
        /*if(loadExpense[0].split("-")[2].length != 2 )
            loadExpense[0] = swapDate(loadExpense[0]);*/
    }, [loadExpense]);


    const swapDate = (date) => {
        date = date.split("-");
        var temp = date[0];
        date[0] = date[2];
        date[2] = temp;
        date = date.join("-");
        return date
    }

    //set date limit
    const setDateLimit = () => {
        document.getElementById("modify-expense-date").max = currentDate();
    }

    const closeModifyExpense = () => {
        handleClose();
    }

    const handlePopupState = (state) => {
        setPopupState(state);
    }

    //json to store popup dialogue content
    const masterContent = {
        "add": {
            "head": "Success",
            "body": "Expense added successfully!"
        },
        "update":{
            "head": "Success",
            "body": "Expense updated successfully!"
        },
        "error": {
            "head": "Error",
            "body": "One or more fields empty!"
        },
        "amountError":{
            "head": "Error",
            "body": "Amount is not a number!"
        },
        "budgetLimitExceeded": {
            "head": "Error",
            "body": "Budget Limit Exceeded!"
        },
        "editError": {
            "head": "Error",
            "body": "Could not edit expense!"
        },
        "amountNegative": {
            "head": "Error",
            "body": "Amount cannot be negative!"
        },
        "merchantFieldEmpty": {
            "head":"error",
            "body":"Merchant cannot be blank!"
        }

    }

    const [content, setContent] = useState(masterContent["error"]);

    //reset form data
    const resetData = () => {
        
        setModifyExpenseData(
            {
                index: "",
                userId: "",
                expenseId: "",
                date: "",
                category: "",
                merchant: "",
                amount:  "",
                paymentMode: ""
            }
        );
    }

    //set data on input value change
    const handleModifyExpenseChange = (name, value) => {
        if(value === "" || value.trim().length === 0)
        {
            document.getElementById(errorMessage[name]).innerHTML = name + " cannot be empty!";
        }
        else
        {
            document.getElementById(errorMessage[name]).innerHTML = "";
        }
        setModifyExpenseData({...modifyExpenseData, [name] : value});
    }
    const accessToken = cookies.get('access_token');
    //validate expense form and submit changes to server
    const handleModifyExpense = (e) => {
        e.preventDefault();
        var flag = true;
        const skipVal = {
            index: 1,
            userId: 1,
            expenseId: 1,
            date: 0,
            category: 0,
            merchant: 0,
            amount:  0,
            paymentMode: 0
        }
        for(const val in modifyExpenseData)
        {
            if(skipVal[val] === 0 && modifyExpenseData[val] === "")
            {
                flag = false;
            }
        }
        if(!flag)
        {
            setContent(masterContent["error"]);
            setPopupState(true);
            return;
        }
        if(modifyExpenseData.amount !== "" && isNaN(modifyExpenseData.amount))
        {
            setContent(masterContent["amountError"]);
            setPopupState(true);
            return;
        }
        if(modifyExpenseData.amount !== "" && parseFloat(modifyExpenseData.amount) < 0)
        {
            setContent(masterContent["amountNegative"]);
            setPopupState(true);
            return;
        }
        if(modifyExpenseData.merchant.trim().length === 0)
        {
            setContent(masterContent["merchantFieldEmpty"]);
            setPopupState(true);
            return;
        }
        var apiURL = "http://localhost:3000/expenses/addExpense";
        const userId = cookies.get('userId');
        const expenseData = {
            // Assuming you want to set the expenseId to  1
            userId:  userId, // Assuming you want to set the userId to  1
            date: modifyExpenseData.date,
            category: modifyExpenseData.category,
            merchant: modifyExpenseData.merchant,
            amount: modifyExpenseData.amount,
            paymentMode: modifyExpenseData.paymentMode
        };
        var updateRow ={};
        setLoading(true);
        if(Object.keys(loadExpense).length ===  0)
        {
            axios.post(apiURL, expenseData, {
                params: {
                    token: accessToken
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).then((response) => {
                setContent(masterContent["add"]);
                setPopupState(true);
                updateRow = {
                    "userId": modifyExpenseData.userId, 
                    "expenseId":response.data.expenseId,
                    "date":modifyExpenseData.date, 
                    "category":modifyExpenseData.category, 
                    "merchant":modifyExpenseData.merchant, 
                    "amount":modifyExpenseData.amount, 
                    "paymentMode":modifyExpenseData.paymentMode
                }
                onAddExpense(updateRow);
                resetData();
                closeModifyExpense();
                
            }).catch((error) => {
                setContent(masterContent["budgetLimitExceeded"]);
                setPopupState(true);
            });
        }
        else
        {
            apiURL = "http://localhost:3000/expenses/updateExpense";
            
            const expenseData = {
            // Assuming you want to set the expenseId to  1
                userId:  userId, // Assuming you want to set the userId to  1
                date: modifyExpenseData.date,
                category: modifyExpenseData.category,
                merchant: modifyExpenseData.merchant,
                amount: modifyExpenseData.amount,
                paymentMode: modifyExpenseData.paymentMode,
                expenseId: modifyExpenseData.expenseId
            };
            axios.put(apiURL, expenseData, {
                params: {
                    token: accessToken
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).then((response) => {
                setContent(masterContent["update"]);
                setPopupState(true);
                updateRow = {
                    "userId": userId, 
                    "expenseId":modifyExpenseData.expenseId,
                    "date":modifyExpenseData.date, 
                    "category":modifyExpenseData.category, 
                    "merchant":modifyExpenseData.merchant, 
                    "amount":modifyExpenseData.amount, 
                    "paymentMode":modifyExpenseData.paymentMode
                }
                onEditExpense(modifyExpenseData.index, updateRow);
                closeModifyExpense();
                resetData();

            }).catch((error) => {
                setContent(masterContent["editError"]);
                setPopupState(true);
            });
        }
        setLoading(false);
        
    }

    //on closing expense form
    const handleClose = () => {
        resetData();
        setShow(false);}
    const handleShow = () => setShow(true);

    
    

    return (
        <>
            <SpinnerComponent state={loading} setState={setLoading}/>
            <Button variant="primary" onClick={handleShow}>
                <Plus/>
            </Button>
            <PopupModal state={popupState} setState={handlePopupState} content={content}/>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Expense Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form id="modify-form">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalDate">
                        <Form.Label className="modify-label" column sm={2}>
                        Date
                        </Form.Label>
                        <Col sm={8}>
                        <Form.Control id ="modify-expense-date" onClick={setDateLimit} name = "date" type="date" placeholder="" value={modifyExpenseData.date} 
                        onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}/>
                        <Form.Label id = "modify-expense-date-error" column sm={12}>
                        </Form.Label>
                        </Col>
                        
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalCategory">
                        <Form.Label className="modify-label" column sm={2}>
                            Category
                        </Form.Label>
                        <Col sm={8}>
                            <Dropdown>
                                <Dropdown.Toggle id = "modify-category" variant="success">
                                    {modifyExpenseData.category !== "" ? modifyExpenseData.category : "Choose Category"}
                                </Dropdown.Toggle>

                                <Dropdown.Menu style={{ maxHeight: '150px', overflowY: 'auto', "width":"300px" }}>
                                    {
                                        categories.map((cat, index) => {
                                            return (
                                                <Dropdown.Item name = "category" value={cat} key = {index} 
                                                onClick={(e)=>{handleModifyExpenseChange(e.target.name, cat)}}>
                                                    {cat}</Dropdown.Item>
                                            )
                                        })
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                            <Form.Label id = "modify-expense-category-error" column sm={12}>
                        </Form.Label>
                        </Col>
                        
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalMerchant">
                        <Form.Label className="modify-label" column sm={2}>
                        Merchant
                        </Form.Label>
                        <Col sm={8}>
                        <Form.Control name = "merchant" placeholder="" value={modifyExpenseData.merchant} 
                        onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}/>
                        <Form.Label id = "modify-expense-merchant-error" column sm={12}>
                        </Form.Label>
                        </Col>
                        
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalAmount">
                        <Form.Label className="modify-label" column sm={2}>
                        Amount
                        </Form.Label>
                        <Col sm={8}>
                        <Form.Control type = "number" step = "1" name = "amount" placeholder="" value={modifyExpenseData.amount} 
                        onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}/>
                        <Form.Label id = "modify-expense-amount-error" column sm={12}>
                        </Form.Label>
                        </Col>
                        
                    </Form.Group>
                    <fieldset>
                        <Form.Group as={Row} className="mb-3">
                        <Form.Label className="modify-label" as="legend" column sm={2}>
                            Payment Mode
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Check
                            type="radio"
                            label="Credit"
                            value="Credit"
                            checked={modifyExpenseData.paymentMode === 'Credit'} 
                            onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode1"
                            />
                            <Form.Check
                            type="radio"
                            label="Debit"
                            value="Debit"
                            checked={modifyExpenseData.paymentMode === 'Debit'} 
                            onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode2"
                            />
                            <Form.Check
                            type="radio"
                            label="UPI"
                            value="UPI"
                            checked={modifyExpenseData.paymentMode === 'UPI'} 
                            onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode3"
                            />
                            <Form.Check
                            type="radio"
                            label="Cash"
                            value="Cash"
                            checked={modifyExpenseData.paymentMode === 'Cash'} 
                            onChange={(e)=>{handleModifyExpenseChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode4"
                            />
                            <Form.Label id = "modify-expense-payment-error" column sm={12}>
                        </Form.Label>
                        </Col>
                        
                        </Form.Group>
                    </fieldset>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button style={{"backgroundColor":"#e26f6f"}} variant="primary" onClick={handleModifyExpense}>
                    Submit
                </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}