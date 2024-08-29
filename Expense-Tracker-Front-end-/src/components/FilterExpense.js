import "../styles/FilterExpense.css";

import { useEffect, useState } from "react";
import { currentDate } from "./currentDate";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import { getCategories } from "./categories";
import { Filter } from "lucide-react";
import PopupModal from "./PopupModal";
import { select } from "@material-tailwind/react";
export default function FilterExpense({ onFilterExpense, expenseData, showFilter, setShowFilter }) {
    const masterContent = {
        "amountError":{
            "head": "Error",
            "body": "Amount is not a number!"
        },
        "filterError": {
            "head": "Error",
            "body": "Choose at least one filter option!"
        }

    }
    const [content, setContent] = useState(masterContent["filterError"]);
    const [filterState, setFilterState] = useState(false);
    var categories = getCategories();
    const [popupState, setPopupState] = useState(false);
    const [filterData, setFilterData] = useState({
        dateFrom: "",
        dateTo: "",
        category: "",
        merchant: "",
        amount: "",
        paymentMode: ""
    })

    //reset the filter
    const resetFilterData = () => {
        set_Selected_categories([]);
        setFilterData({
            dateFrom: "",
            dateTo: "",
            category: "",
            merchant: "",
            amount: "",
            paymentMode: ""
        });
    }

    //set date limit from on filter
    const setDateLimitFrom = () => {
        if(filterData.dateTo !== "")
            document.getElementById("modify-filter-date-from").max = filterData.dateTo;
        else
            document.getElementById("modify-filter-date-from").max = currentDate();
    }

    //set date limit to on filter
    const setDateLimitTo = () => {
        if(filterData.dateFrom !== "")
            document.getElementById("modify-filter-date-to").min = filterData.dateFrom;
        document.getElementById("modify-filter-date-to").max = currentDate();
    }

    
    //store filter data on input change
    const handleFilterChange = (name, value) => {
        var flag = false;
        if(value === "")
        {
            for(const val in filterData)
            {
                if(filterData[val] !== "")
                {
                    flag = true;
                    break;
                }
            }
        }
        if(flag || value !== "")
            setFilterState(true);
        else
            setFilterState(false);
        setFilterData({...filterData, [name]: value})
    }

    //filter date from. Takes array and date from as parameter.
    const filterDateFrom = (arr, from) => {
        return arr.filter((row)=>row.date >= from);
    }

    //filter date to. Takes array and date to as parameter.
    const filterDateTo = (arr, to) => {
        return arr.filter((row)=>row.date <= to);
    }

    //checks if string2 is presen in string1
    function filterByString(string1, string2) {
        return string1.toLowerCase().includes(string2.toLowerCase());
    }

    //filters array on basis of key and checks it against value
    const filterString = (arr, key, value) => {
        return arr.filter((row) => filterByString(row[key], value));
    }

    //checks if n and value are numerically equal
    function filterByNumber(n, value) {
        n = parseFloat(n);
        value = parseFloat(value);
        return n === value;
    }

    //filters array on basis of value of key being equal to value
    const filterNumber = (arr, key, value) => {
        
        return arr.filter((row) => filterByNumber(row[key], value));
    }

    //filters array on basis of payment mode
    const filterPayment = (arr, mode) => {
        return arr.filter((row)=>row.paymentMode === mode)
    }

    //handles submit request, validates filter inputs and sets expense data to filtered data
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        var newArray = expenseData;
        if(!filterState && selected_categories.length === 0)
        {
            setContent(masterContent["filterError"]);
            setPopupState(true);
            return;
        }
        if(filterData.amount !== "" && isNaN(filterData.amount))
        {
            setContent(masterContent["amountError"]);
            setPopupState(true);
            return;
        }
        if(filterData.dateFrom !== "")
        {
            newArray = filterDateFrom(newArray, filterData.dateFrom);
        }
        if(filterData.dateTo !== "")
        {
            newArray = filterDateTo(newArray, filterData.dateTo);
        }
        if(selected_categories.length > 0)
        {
            var copyArray = [];
            var temp = [];
            for(var i = 0; i < selected_categories.length; i++)
            {
                copyArray = filterString(newArray, "category", selected_categories[i]);
                temp = temp.concat(copyArray);
            }
            newArray = temp;
            
                
        }
        if(filterData.merchant !== "")
        {
            newArray = filterString(newArray, "merchant", filterData.merchant);
        }
        if(filterData.amount !== "")
        {
            newArray = filterNumber(newArray, "amount", filterData.amount);
        }
        if(filterData.paymentMode !== "")
        {
            newArray = filterPayment(newArray, filterData.paymentMode);
        }
        // console.log(filterPayment(newArray, filterData.paymentMode));
        onFilterExpense(newArray);
        setShowFilter(false);
        set_Selected_categories([]);
    }

    //on closing filter form
    const handleClose = () => {
        resetFilterData();
        setShowFilter(false);
    }
    const handleShow = () => setShowFilter(true);

    const handlePopupState = (state) => {
        setPopupState(state);
    }

    //stores multiple selected categories from dropdown category button
    const [selected_categories, set_Selected_categories] =  
        useState([]); 

        const toggleCat = (option) => { 
            if (selected_categories.includes(option)) { 
                set_Selected_categories( 
                    selected_categories.filter((item) =>  
                        item !== option)); 
            } else { 
                set_Selected_categories( 
                    [...selected_categories, option]); 
            } 
        }; 
    
    useEffect(()=>{
        if(!showFilter)
        {
            resetFilterData();
            set_Selected_categories([]);
        }
    }, [showFilter]);

    function show_selected_categories() {
        var res = "";
        for(var i = selected_categories.length-1; i >= 0; i--)
        {
            // console.log(i-selected_categories.length-1);
            if (selected_categories.length-1-i > 1)
            {
                res += ", ..."
                return res;
            }
            res += selected_categories[i];
            if (selected_categories.length > 0)
                res += ", "
            
            
                
        }
        return res;
    }

        


    return (
        <>
            <PopupModal state={popupState} setState={handlePopupState} content={content}/>
            <Button variant="primary" onClick={handleShow}>
                <Filter/>
            </Button>

            <Modal show={showFilter} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Filter Expenses</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form id="filter-form">
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalDateFrom">
                        <Form.Label column sm={2}>
                        Date From
                        </Form.Label>
                        <Col sm={4}>
                        <Form.Control id = "modify-filter-date-from" name = "dateFrom" type="date" 
                        placeholder="" value={filterData.dateFrom} onClick={setDateLimitFrom}
                        onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}/>
                        </Col>
                        
                        <Form.Label column sm={2}>
                        Date To
                        </Form.Label>
                        <Col sm={4}>
                        <Form.Control id= "modify-filter-date-to" name = "dateTo" type="date" 
                        placeholder="" value={filterData.dateTo} onClick={setDateLimitTo}
                        onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}/>
                        </Col>
                        
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalDateTo">
                        <Form.Label id = "modify-expense-date-error" column sm={2}>
                        </Form.Label>
                        <Form.Label id = "modify-expense-date-error" column sm={2}>
                        </Form.Label>
                    </Form.Group>
                    
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalCategory">
                        <Form.Label column sm={2}>
                            Category
                        </Form.Label>
                        <Col sm={10}>
                            <Dropdown>
                                <Dropdown.Toggle style={{"backgroundColor":"#e26f6f", "width": "350px"}} variant="success" id="dropdown-basic">
                                    <span>
                                    {selected_categories.length === 0? 
                                    <>Choose Category
                                    </>
                                    :
                                    show_selected_categories()}
                                    </span>
                                    
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ maxHeight: '150px', overflowY: 'auto', "width":"350px" }}> 
                                {categories.map((cat, index) => ( 
                                        <Form.Check
                                        key={index}
                                        type="checkbox"
                                        label={cat}
                                        checked={selected_categories.includes(cat)}
                                        onClick={()=>toggleCat(cat)
                                        }
                                        style={{ "margin":"10px"}}
                                        />
                                    ))} 
                                </Dropdown.Menu> 
                            </Dropdown>
                        </Col>
                        <Form.Label id = "modify-expense-category-error" column sm={2}>
                        </Form.Label>
                    </Form.Group>


                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalMerchant">
                        <Form.Label column sm={2}>
                        Merchant
                        </Form.Label>
                        <Col sm={10}>
                        <Form.Control name = "merchant" placeholder="" value={filterData.merchant} 
                        onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}/>
                        </Col>
                        <Form.Label id = "modify-expense-merchant-error" column sm={2}>
                        </Form.Label>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formHorizontalAmount">
                        <Form.Label column sm={2}>
                        Amount
                        </Form.Label>
                        <Col sm={10}>
                        <Form.Control name = "amount" placeholder="" value={filterData.amount} 
                        onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}/>
                        </Col>
                        <Form.Label id = "modify-expense-amount-error" column sm={2}>
                        </Form.Label>
                    </Form.Group>
                    <fieldset>
                        <Form.Group as={Row} className="mb-3">
                        <Form.Label as="legend" column sm={2}>
                            Payment Mode
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Check
                            type="radio"
                            label="Credit"
                            value="Credit"
                            checked={filterData.paymentMode === 'Credit'} 
                            onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode1"
                            />
                            <Form.Check
                            type="radio"
                            label="Debit"
                            value="Debit"
                            checked={filterData.paymentMode === 'Debit'} 
                            onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode2"
                            />
                            <Form.Check
                            type="radio"
                            label="UPI"
                            value="UPI"
                            checked={filterData.paymentMode === 'UPI'} 
                            onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode3"
                            />
                            <Form.Check
                            type="radio"
                            label="Cash"
                            value="Cash"
                            checked={filterData.paymentMode === 'Cash'} 
                            onChange={(e)=>{handleFilterChange(e.target.name, e.target.value)}}
                            name="paymentMode"
                            id="mode4"
                            />
                        </Col>
                        </Form.Group>
                    </fieldset>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button style={{"backgroundColor":"#e26f6f"}} variant="primary" onClick={handleFilterSubmit}>
                    Submit
                </Button>
                </Modal.Footer>
            </Modal>
        </>
        
    )
}