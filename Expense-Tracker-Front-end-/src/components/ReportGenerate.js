import React, { useState, useEffect } from 'react';
import axios from 'axios';
/*import Excel from 'exceljs';*/
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import PopupModal from './PopupModal';
import SpinnerComponent from './SpinnerComponent';
import { currentDate } from './currentDate';
import { getCategories } from './categories';
import Dropdown from 'react-bootstrap/Dropdown';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import "../styles/ReportGenerate.css";
import Cookies from 'universal-cookie';
 
 
const ReportGenerate = () => 
{
    const cookies = new Cookies();
    const [popupState, setPopupState] = useState(false);
    const handlePopupState = (state) => {
        setPopupState(state);
    }
    const [loading, setLoading] = useState(false);
    
    const [expenses, setExpenses] = useState([]);
    
    const masterContent = {
        "error": {
        "head": "Error",
        "body": "Please enter a valid date!"
        },
        "dailyReportError": {
        "head": "Error",
        "body": "Please select a valid date!"
        },
        "monthlyReportError": {
        "head": "Error",
        "body": "Please select a valid month!"
        },
        "yearlyReportError": {
        "head": "Error",
        "body": "Please enter a valid year!"
        },
        "fetchError": {
        "head": "Error",
        "body": "Could not fetch data!"
        },
        "noDataFound": {
        "head": "Error",
        "body": "No data found!",
        },
        "yearlyErrorRange": {
        "head": "Error",
        "body": "Year out of range!"
        }
    }
    
    const [content, setContent] = useState(masterContent["error"]);
    const [paymentModeFilter, setPaymentModeFilter] = useState('');
    const [merchantFilter, setMerchantFilter] = useState('');
    const [dailyReportDate, setDailyReportDate] = useState('');
    const [monthlyReportMonth, setMonthlyReportMonth] = useState('');
    const [yearlyReportYear, setYearlyReportYear] = useState('');
    const [periodStartDate, setPeriodStartDate] = useState('');
    const [periodEndDate, setPeriodEndDate] = useState('');
    const [reportType, setReportType] = useState('');
    const categories = getCategories();
    
    useEffect(() => {
        const fetchExpenses = async () => {
        try {
            // const userId = cookies.get('userId');
            const accessToken = cookies.get('access_token');
    
            const response = await axios.get(`http://localhost:3000/expenses/${accessToken}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            });
    
            // const response = await axios.get(`http://localhost:3000/expenses/3`);/'
            var newArray = [];
            for (var index in response.data) {
            var row = response.data[index];
            //
            row.date = row.date.slice(0, 10);
            newArray.push({
                "userId": row.userId,
                "expenseId": row.expenseId,
                "date": row.date,
                "category": row.category,
                "merchant": row.merchant,
                "amount": row.amount,
                "paymentMode": row.paymentMode
            });
            }
            setExpenses(newArray);
    
    
    
    
        } catch (error) {
            setContent(masterContent["fetchError"]);
            setPopupState(true);
        }
        };
    
        fetchExpenses();
    }, []);
    
    
    
    
    
    
    const handleDailyReport = () => {
        if (dailyReportDate === "") {
        setContent(masterContent["dailyReportError"]);
        setPopupState(true);
        }
        else {
        var filteredExpenses = expenses.filter((expense) => {
            return expense["date"].slice(0, 10) === dailyReportDate;
        });
        if (filteredExpenses.length === 0) {
            setContent(masterContent["noDataFound"]);
            setPopupState(true);
        }
        else {
            savePDF(filteredExpenses);
        }
        }
    };
    const handleMonthlyReport = () => {
        if (monthlyReportMonth === "") {
        setContent(masterContent["monthlyReportError"]);
        setPopupState(true);
        }
        else {
        var filteredExpenses = expenses.filter((expense) => {
            return expense["date"].slice(0, 7) === monthlyReportMonth;
        });
        if (filteredExpenses.length === 0) {
            setContent(masterContent["noDataFound"]);
            setPopupState(true);
        }
        else {
            savePDF(filteredExpenses);
        }
        }
    };
    
    const handleYearlyReport = () => {
        console.log(currentDate().slice(0, 4))
        if (yearlyReportYear === "" || isNaN(yearlyReportYear)) {
        setContent(masterContent["yearlyReportError"]);
        setPopupState(true);
        }
        else if (yearlyReportYear > currentDate().slice(0, 4) || yearlyReportYear < 1970) {
        setContent(masterContent["yearlyErrorRange"])
        setPopupState(true);
        }
        else {
        var filteredExpenses = expenses.filter((expense) => {
            return expense["date"].slice(0, 4) === yearlyReportYear;
        });
        if (filteredExpenses.length === 0) {
            setContent(masterContent["noDataFound"]);
            setPopupState(true);
        }
        else {
            savePDF(filteredExpenses);
        }
        }
    };
    
    
    
    const savePDF = async (expenses) => {
        try {
        setLoading(true);
        const doc = new jsPDF();
        const tableColumn = ["Date", "Category", "Merchant", "Amount", "Payment Mode"];
        const tableRows = [];
    
        expenses.forEach(expense => {
            tableRows.push([
            expense.date,
            expense.category,
            expense.merchant,
            expense.amount,
            expense.paymentMode
            ]);
        });
    
        doc.autoTable(tableColumn, tableRows, {
            startY: 20,
            styles: { overflow: 'linebreak' },
            columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' }
            }
        });
    
        doc.save('Expenses_Report.pdf');
        setLoading(false);
        } catch (error) {
        setLoading(false);
        console.error('Error generating PDF report:', error);
        }
    
    
    /* const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'Expenses_Report.xlsx');
    setLoading(false);
    } catch (error) {
    setLoading(false);
    console.error('Error generating Excel report:', error);*/
    };
    
    
    
    
    
    const handleAllFieldsReport = () => {
        // If only the start date is provided, set the end date to the current date
        let endDate = periodEndDate ? periodEndDate : currentDate();
        endDate = endDate.slice(0, 10);
    
    
        var filteredExpenses = expenses;
        if (periodStartDate !== "") {
        filteredExpenses = filteredExpenses.filter((expense) => {
            return expense["date"] >= periodStartDate;
        });
        }
        if (endDate !== "") {
        filteredExpenses = filteredExpenses.filter((expense) => {
            return expense["date"] <= endDate;
        });
        }
        if (selected_categories.length !== 0) {
        var temp = [];
        for (var i = 0; i < selected_categories.length; i++) {
            temp = temp.concat(filteredExpenses.filter((expense) => {
            return expense["category"] === selected_categories[i];
            }));
        }
        filteredExpenses = temp;
        console.log(filteredExpenses)
        }
    
        if (merchantFilter !== "") {
        filteredExpenses = filteredExpenses.filter((expense) => {
            return expense["merchant"] === merchantFilter;
        });
        }
        if (paymentModeFilter !== "") {
        filteredExpenses = filteredExpenses.filter((expense) => {
            return expense["paymentMode"] === paymentModeFilter;
        });
        }
        savePDF(filteredExpenses);
    };
    
    const [selected_categories, set_Selected_categories] =
        useState([]);
    
    const toggleCat = (option) => {
        console.log(option)
        if (selected_categories.includes(option)) {
        set_Selected_categories(
            selected_categories.filter((item) =>
            item !== option));
        } else {
        set_Selected_categories(
            [...selected_categories, option]);
        }
    };
    
    function setStartDateLimit() {
        document.getElementById("periodStartDate").max = currentDate();
    }
    function setEndDateLimit() {
        if (periodStartDate !== undefined)
        document.getElementById("periodEndDate").min = periodStartDate;
        console.log(periodStartDate);
        document.getElementById("periodEndDate").max = currentDate();
    }
    
    function show_selected_categories() {
        var res = "";
        if (selected_categories.length - 1 > 0) {
        res += selected_categories[0];
        res += ", ..."
        }
        else {
        res += selected_categories[0];
        }
    
        return res;
    };
    
    return (
        <div>
        <SpinnerComponent state={loading} setState={setLoading} />
        <PopupModal state={popupState} setState={handlePopupState} content={content} />
        <div className="report-container">
        <div className='report-input'>
            {
              <>
                <Form id= "report-form">
                <Form.Group as={Row} className="mb-3" controlId="formHorizontal">
                    <Form.Label column sm={2} style={{"marginTop":"40px"}}>
                        Category
                    </Form.Label>
                    <Col sm={10}>
                    <Dropdown>
                    <Dropdown.Toggle style={{"width":"200px","backgroundColor":"#e26f6f", "marginLeft":"50px", "marginTop":"40px"}} variant="success" id="dropdown-basic">
                      <span>
                        {selected_categories.length === 0? 
                        <>Choose Category
                        </>
                        :
                        show_selected_categories()}
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ maxHeight: '150px', overflowY: 'auto', 'width':"220px" }}> 
                        {categories.map((cat, index) => ( 
                                <Form.Check
                                key={index}
                                type="checkbox"
                                label={<span style={{"margin-left":"10px"}}>{cat}</span>}
                                checked={selected_categories.includes(cat)}
                                onClick={()=>toggleCat(cat)}
                                style={{"width":'20px', "margin":"10px","textWrap":"nowrap"}}
                                />
                            ))} 
                        </Dropdown.Menu> 
                    </Dropdown>
                    </Col>
                    <Form.Label id = "modify-expense-category-error" column sm={2}>
                    </Form.Label>
                        </Form.Group>
                </Form>
                
                
                
                
              </>
            }
            </div>
            <div className='report-input'>
            <label htmlFor="paymentModeFilter">Payment Mode:</label>
            <select
              id="paymentModeFilter"
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="report-input"
            >
              <option value="">Select a payment mode</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
            </div>
            <div className='report-input'>
            <label htmlFor="merchantFilter">Merchant:</label>
            <input
              type="text"
              id="merchantFilter"
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="report-input"
            />
            </div>
        </div>
    
        <div className="report-container" style={{"height":"140px"}}>
          <div className='report-input'>
            <label htmlFor="periodStartDate" style={{"marginRight":"20px"}}>Start Date:</label>
            <input
              type="date"
              id="periodStartDate"
              value={periodStartDate}
              onClick={setStartDateLimit}
              onChange={(e) => {
                
                setPeriodStartDate(e.target.value)}
              }
              className="report-input"
            />
            </div>
            <div className='report-input'>
            <label htmlFor="periodEndDate" style={{"marginRight":"20px"}}>End Date:</label>
            <input
              type="date"
              id="periodEndDate"
              value={periodEndDate}
              onClick={setEndDateLimit}
              onChange={(e) => {
                
                setPeriodEndDate(e.target.value)
              }}
              className="report-input"
            />
            </div>
           
          </div>
        <div className='report-container' style={{"display":"flex", "justifyContent":"center", "backgroundColor":"white", "boxShadow":"none"}}>
        <button className="report-button" onClick={handleAllFieldsReport}>Generate Report Based on All Fields</button>
        </div>
        <div className='report-container'>
              <div className='report-input'>
                <label htmlFor="dailyReportDate">Daily Report</label>
                  <input
                    type="date"
                    id="dailyReportDate"
                    value={dailyReportDate}
                    onChange={(e) => setDailyReportDate(e.target.value)}
                    className="report-input"
                  />
                  <button className="report-button" onClick={handleDailyReport}>Daily Report</button>
              </div>
              <div className='report-input'>
                <label htmlFor="monthlyReportMonth">Monthly Report</label>
                    <input
                      type="month"
                      id="monthlyReportMonth"
                      value={monthlyReportMonth}
                      onChange={(e) => setMonthlyReportMonth(e.target.value)}
                      className="report-input"
                    />
                    <button className="report-button" onClick={handleMonthlyReport}>Monthly Report</button>
              </div>
              <div className='report-input'>
                <label htmlFor="yearlyReportYear">Year Report</label>
                    <input
                      id="yearlyReportYear"
                      value={yearlyReportYear}
                      onChange={(e) => setYearlyReportYear(e.target.value)}
                      className="report-input"
                    />
                    <button className="report-button" onClick={handleYearlyReport}>Yearly Report</button>
              </div>
        </div>
      </div>
        );
}
      export default ReportGenerate;