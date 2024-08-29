import ModifyExpense from "../components/ModifyExpense.js";
import "../styles/Transactions.css"
import "../styles/FilterExpense.css"
import "../styles/ModifyExpense.css"
import "../styles/NotificationPanel.css"
import { useEffect, useState } from "react";
import FilterExpense from "../components/FilterExpense.js";
import axios from 'axios';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
import MonthlyBudgetModal from "./MonthlyBudgetModal.js";
import Pagination from 'react-bootstrap/Pagination';
import {
    RotateCcw,
    Pencil,
    Delete,
    ArrowBigRight,
    ArrowBigLeft
  } from "lucide-react";
 
import PopupModal from "./PopupModal.js";
import Cookies from "universal-cookie";


export default function Transactions({ userId }) {
    const cookies = new Cookies();
    const [popupState, setPopupState] = useState(false);
    const handlePopupState = (state) => {
        setPopupState(state);
    }
 
   
 
    const masterContent = {
        "budgetExceededError": {
          "head": "Warning",
          "body": "Budget goal has been reached for this month"
      },
      "ninetyError": {
        "head": "Warning",
        "body": "Budget goal has been  90% reached for this month"
      },
      "delete": {
        "head": "Success",
        "body": "Successfully deleted!"
      },
      "deleteError": {
        "head": "Error",
        "body": "Could not delete expense!"
      },
      "fetchError": {
        "head": "Error",
        "body": "Could not fetch data!"
      }
 
 
  }
 
  const [content, setContent] = useState(masterContent["budgetExceededError"]);
    const tableHead = ["Date", "Category", "Merchant", "Amount", "Mode", "Modify"];
    const cat = {
        "Date":"date",
        "Category":"category",
        "Merchant":"merchant",
        "Amount":"amount",
        "Mode":"paymentMode",
        "Modify":"modify"
    };
   
 
    const itemCount = 8;
    const [pageCounter, setPageCounter] = useState(1);
 
    const [sortButtonState, setSortButtonState] = useState({
        "Date": false,
        "Category": false,
        "Merchant": false,
        "Amount": false,
        "Mode": false
    });
    const [masterExpenses, setMasterExpenses] = useState([]);
 
    //to generate dummy rows based on length of expenses array
    const getDummyRows = () => {
        var dummyRowLength = expenses.length === 0 ? itemCount : expenses.length%itemCount!==0?itemCount-expenses.length%itemCount:0;
        var rows = [];
        for(var i = 0; i < dummyRowLength; i++)
        {
            var row = [];
            for(var j = 0; j < 6; j++)
            {
                row.push("");
            }
            rows.push(row);
        }
        return rows;
    }
 
    const [expenses, setExpenses] = useState([]);
   
    //returns total pages
    const totalPages = () =>
    {
        return Math.max(Math.ceil(expenses.length/itemCount), 1);
    }
 
    //to go to first page on transactions
    const gotoFirstPage = () => {
        setPageCounter(prevState=> 1);
    }
 
    //to go to last page on transactions
    const gotoLastPage= () => {
        setPageCounter(prevState => totalPages());
    }
   
    //increase page count
    const increasePageCounter = () => {
        var total = totalPages();
        setPageCounter(prevState => Math.min(total, prevState+1) );
    }
 
    //decrease page count
    const decreasePageCounter = () => {
        setPageCounter(prevState => Math.max(1, prevState-1) );
    }
 
    const [show, setShow] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
 
 
    //set expenses when master expeneses changes
    useEffect(() => {
       
        setExpenses(masterExpenses);
    }, [masterExpenses]);
 
    //rectify page count when expenses data changes
    useEffect(()=> {
        if(pageCounter > totalPages())
        {
            setPageCounter(pageCounter => Math.min(totalPages(), pageCounter));
        }
    }, [expenses]);

    const accessToken = cookies.get('access_token');

    //load expenses data for user
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/expenses/${accessToken}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  });
               
                var newArray = [];
                for(var index in response.data)
                {
                    var row = response.data[index];
                    //
                    row.date = row.date.slice(0, 10);
                    newArray.push({
                        "userId": row.userId,
                        "expenseId":row.expenseId,
                        "date":row.date,
                        "category":row.category,
                        "merchant":row.merchant,
                        "amount":row.amount,
                        "paymentMode":row.paymentMode});
                }
                setMasterExpenses(newArray);
               
                const emailId = response.data.email  
                
                const response1 = await axios.get(`http://localhost:3000/total/${accessToken}`, {
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                            },
                          });
                // console.log("response1234", response1)
                
                if (localStorage.getItem("lastMonthNineReachedEmailSent") == 0)
                {
                    if (response1.data.remaining_budget <= response1.data.monthly_budget * 0.1) {
                    const currentMonth = new Date().getMonth();
                    localStorage.setItem("lastMonthNineReachedEmailSent", 1)
                    const lastMonthNineReachedEmailSent = cookies.get('lastMonthNineReachedEmailSent');
                    
                    if (lastMonthNineReachedEmailSent !== currentMonth.toString()) {
                        const response = await axios.post(`http://localhost:3000/total/send-email/budget-exceeded`, { token: accessToken }, {
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                            },
                          });
                    if (response)
                    {
                        setContent(masterContent["ninetyError"]);
                        setPopupState(true);
                        // Store the current month in local storage to prevent sending the email again
                        cookies.set('lastMonthNineReachedEmailSent', currentMonth.toString(), { path: '/' });
                    }
                  }
                }}
                   
                  // Check if the user has exceeded their monthly budget
                  
                  if (localStorage.getItem("remaininingBudgetZero") == 0)
                  {
                    localStorage.setItem("remaininingBudgetZero", 1)
                    if (response1.data.remaining_budget <=   0) {
                    const currentMonth = new Date().getMonth();
                    const lastMonthEmailSent = cookies.get('lastMonthEmailSent');
                    if (lastMonthEmailSent !== currentMonth.toString()){
                    const response = await axios.post(`http://localhost:3000/total/send-email/budget-exceeded`, { token: accessToken   }, {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                        },
                      });
                    if (response)
                    {
                        setContent(masterContent["budgetExceededError"]);
                        setPopupState(true);
                        cookies.set('lastMonthEmailSent', currentMonth.toString(), { path: '/' });
                    }
                  }
                }}
 
 
            } catch (error) {
                setContent(masterContent["fetchError"]);
                setPopupState(true);
            }
        };
       
        fetchExpenses();
    }, [userId]);
 
   
 
    const [sendExpense, setSendExpense] = useState([]);
 
    //change expenses when expense form returns new expense
    const modifyAddExpense = (newExpense) => {
        var newMasterExpense = [...masterExpenses, newExpense];
        setSendExpense([]);
        setMasterExpenses(newMasterExpense);
    };
 
    //change expenses when expense form returns modified expense
    const modifyEditExpense = (index, newExpense) => {
        setMasterExpenses(prevArray => {
            const newArray = [...prevArray];
            newArray[index] = newExpense;
            return newArray;
        });
    }
 
    //change expenses when expense is deleted and submit delete request to server
    const modifyDeleteExpense = (index) => {
        index = index + (pageCounter-1)*itemCount;
        // console.log("expenses[index].expenseId", expenses[index].expenseId)
        // console.log(expenses[index]);
        
        axios.delete('http://localhost:3000/expenses/deleteExpense', {
            data: {
                expense_id: expenses[index].expenseId,      
                user_id: cookies.get("userId")
            },
            params: {
                token: accessToken
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).
        then((response) => {
            setContent(masterContent["delete"]);
            setPopupState(true);
            setMasterExpenses(prevArray => {
                const newArray = [...prevArray];
                newArray.splice(index,   1);
                return newArray;
            });
           
        }).catch((error) => {
            setContent(masterContent["deleteError"]);
            setPopupState(true);
        });
       
    }
 
    const modifyFilterExpense = (filterData) => {
        setExpenses(filterData);
    }
 
    const resetFilter = () => {
        setExpenses(masterExpenses);
    }
 
 
 
    const handleEditExpense = (index) => {
        index = index+(pageCounter-1)*itemCount;
        setShow(true);
        setSendExpense({"index":index, ...expenses[index]});
    }
 
    const handleDeleteExpense = (index) => {
 
        modifyDeleteExpense(index);
    }
 
    function sortByColumn(arr, columnName) {
        return arr.sort((a, b) => {
            const aValue = columnName ===  "amount" ? parseFloat(a[columnName]) : a[columnName];
            const bValue = columnName ===  "amount" ? parseFloat(b[columnName]) : b[columnName];
 
            if (aValue < bValue) {
                return -1;
            }
            if (aValue > bValue) {
                return   1;
            }
            return   0;
        });
    }
 
    function sortByColumnReverse(arr, columnName) {
        return arr.sort((a, b) => {
            const aValue = columnName ===   "amount" ? parseFloat(a[columnName]) : a[columnName];
            const bValue = columnName ===   "amount" ? parseFloat(b[columnName]) : b[columnName];
 
            if (aValue > bValue) {
                return -1;
            }
            if (aValue < bValue) {
                return -1;
            }
            return   0;
        });
    }
 
    const sortTableBy = (value) => {
        const indexValueMap = {
            "date":   2,
            "category":   3,
            "merchant":   4,
            "amount":   5,
            "paymentMode":   6
        };
        if (!indexValueMap[value]) {
            return;
        }
        var newArray = expenses;
        if (!sortButtonState[value]) {
            newArray = sortByColumn(newArray, value);
            setSortButtonState({ ...sortButtonState, [value]: true });
        } else {
            newArray = sortByColumnReverse(newArray, value);
            setSortButtonState({ ...sortButtonState, [value]: false });
        }
 
        if (newArray !== expenses) {
            setExpenses(newArray);
        }
    }

    function getPagination() {
        const offset = 3;
        let items = [];
        items.push(
            <Pagination.Item id="expense-table-selector-button" key={1} onClick={()=>{setPageCounter(1)}}>
            {1}
            </Pagination.Item>,
        );
        if(pageCounter <= totalPages() && pageCounter > offset && totalPages() > offset+2)
        {
            items.push(<Pagination.Ellipsis id="expense-table-selector-button" disabled/>)
        }
        var start = 0;
        var end = 0;
        if(totalPages() > offset+2)
        {
            start = Math.min(Math.max(2, pageCounter-Math.floor(offset/2)), totalPages()-offset);
            end = Math.max(Math.min(totalPages()-1, pageCounter+Math.floor(offset/2)), offset+1);
        }
        else
        {
            start = 2;
            end = totalPages()-1;
        }
        for (let number = start; number <= end; number++) 
        {
            // console.log(number);
            items.push(
                <Pagination.Item id="expense-table-selector-button" key={number} onClick={()=>{setPageCounter(number)}}>
                {number}
                </Pagination.Item>,
            );
        }
        if(totalPages() > offset+1 && pageCounter >= 1 && pageCounter <= (totalPages()-offset)  && totalPages() > offset+2)
        {
            items.push(<Pagination.Ellipsis id="expense-table-selector-button" disabled/>)
        }
        if(totalPages() > 1)
        {
            items.push(
                <Pagination.Item id="expense-table-selector-button" key={totalPages()} onClick={()=>{setPageCounter(totalPages())}}>
                {totalPages()}
                </Pagination.Item>,
            );
        }
        
        return <Pagination>{items}</Pagination>;
    }



     return (
        <div id = "transaction-div">
            <PopupModal state={popupState} setState={handlePopupState} content={content}/>
            <div id = "expense-table">
                        <div id= "expense-table-options">
                            <ModifyExpense onAddExpense={modifyAddExpense} onEditExpense={modifyEditExpense}
                            loadExpense={sendExpense} setLoadExpense={setSendExpense} show={show} setShow={setShow}/>
                            <FilterExpense onFilterExpense={modifyFilterExpense}
                            expenseData={masterExpenses} showFilter={showFilter} setShowFilter={setShowFilter}/>
                            <button className="expense-table-button expense-table-options-button"
                            id = "reset-filter-button" onClick={resetFilter}><RotateCcw/></button>
                            <MonthlyBudgetModal/>
                        </div>
                        <table>
                        <tbody id = "expense-tbody">
                            <tr>
                                <>
                                    <th className="expense-table-index">#</th>
                                    {
                                    tableHead.map((head, index) => (
                                        <>
                                           
                                            <th className = "expense-table-th expense-table-th-td" key = {index} onClick={()=>{sortTableBy(cat[head])}}>
                                                {head}
                                            </th>
                                        </>
                                       
                                        )
                                    )
                                }
                                </>
                            </tr>
                            
                            {
                                expenses.slice((pageCounter-1)*itemCount, pageCounter*itemCount).map((row, index) => {
                                return (
                                    <tr key={index} >
                                        <td className="expense-table-index">{index+1+(pageCounter-1)*itemCount}</td>
                                        {Object.values(row).map((value, cellIndex) => {
                                            if(cellIndex > 1)
                                            {
                                                if(cellIndex === 2)
                                                    return <td className="expense-table-th-td expense-table-date-td" key={cellIndex}>{value}</td>;
                                                else if(cellIndex === 3)
                                                    return <td className="expense-table-th-td expense-table-category-td" key={cellIndex}>{value}</td>;
                                                else if(cellIndex === 4)
                                                    return <td className="expense-table-th-td expense-table-merchant-td" key={cellIndex}>{value}</td>;
                                                else if(cellIndex === 5)
                                                    return <td key={cellIndex}>{value}</td>;
                                                else if(cellIndex === 6)
                                                    return <td key={cellIndex}>{value}</td>;
                                                else
                                                    return <td className="expense-table-th-td" key={cellIndex}>{value}</td>;
                                            }
                                                
                                        })}
                                        <td className="expense-table-th-td expense-table-edit-delete">
                                            <button className="expense-table-button" onClick={() => handleEditExpense(index)}><Pencil/></button>
                                            <button className="expense-table-button" onClick={() => handleDeleteExpense(index)}><Delete/></button>
                                        </td>
                                    </tr>
                                        );
                                }
                        )}
                        {
                             pageCounter === totalPages() && getDummyRows().map((row, index) => {
                                return (
                                    <tr key = {(itemCount-expenses.length%itemCount)+index}>
                                        <td className="expense-table-index expense-table-th-td" key={0} >{""}</td>
                                        {
                                            row.map((value, cellIndex) => {
                                                {
                                                    if(cellIndex === 2)
                                                        return <td className="expense-table-th-td expense-table-date-td" key={cellIndex}>{value}</td>;
                                                    else if(cellIndex === 3)
                                                        return <td className="expense-table-th-td expense-table-category-td" key={cellIndex}>{value}</td>;
                                                    else if(cellIndex === 4)
                                                        return <td className="expense-table-th-td expense-table-merchant-td" key={cellIndex}>{value}</td>;
                                                    else if(cellIndex === 5)
                                                        return <td className="expense-table-th-td expense-table-amount-td" key={cellIndex}>{value}</td>;
                                                    else if(cellIndex === 6)
                                                        return <td className="expense-table-th-td expense-table-payment-td" key={cellIndex}>{value}</td>;
                                                    else
                                                        return <td className="expense-table-th-td" key={cellIndex}>{value}</td>;
                                                }
                                               
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                       
                       
                        </tbody>
                       
                        </table>
                        {/* {expenses.length > 10 &&    <div >
                                            {pageCounter !== 1 && <button className="expense-table-button expense-table-selector-button" onClick={gotoFirstPage}>1</button>}
                                            {pageCounter !== 1 && <button className="expense-table-button expense-table-selector-button" style={{"fontSize":"14px"}} onClick={decreasePageCounter}>{"<"}</button>}
                                            <button className="expense-table-button expense-table-selector-button" style={{"text-decoration": "underline"}}>{pageCounter}</button>
                                            {pageCounter !== totalPages() && <button className="expense-table-button expense-table-selector-button" style={{"fontSize":"14px"}} onClick={increasePageCounter}>{">"}</button>}
                                            {pageCounter !== totalPages() && <button className="expense-table-button expense-table-selector-button" onClick={gotoLastPage}>{totalPages()}</button>}
                                        </div>}   */}
                        {
                            expenses.length > itemCount && 
                            <div id="page-selector">
                                {getPagination()}
                            </div>
                        }
                    </div>
    </div>
  );
}