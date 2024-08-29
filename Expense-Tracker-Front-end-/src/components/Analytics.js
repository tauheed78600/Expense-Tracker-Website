import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import axios from 'axios';
import "../styles/Analytics.css";
import PopupModal from './PopupModal';
import SpinnerComponent from './SpinnerComponent';


const Analytics = ({ userId }) => {
  const [selection, setSelection] = useState(1);
 
  const masterContent = {
    "fetchError":{
        "head": "Error",
        "body": "Could not fetch data"
    }
 
}
const [popupState, setPopupState] = useState(false);

const handlePopupState = (state) => {
  setPopupState(state);
}
 
 
 
const [content, setContent] = useState(masterContent["fetchError"]);
  const [expensesData, setExpensesData] = useState({});
  const chartRefs = {
    lineChart: null,
    barChart: null,
    pieChart: null,
    pieChart1: null,
  };

  const [loading, setLoading] = useState(false);
 //load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const expensesResponse = await axios.get(`http://localhost:3000/api/data/${userId}`);
        const categoriesResponse = await axios.get(`http://localhost:3000/api/data1/${userId}`);
        const merchantsResponse = await axios.get(`http://localhost:3000/api/data1/${userId}`);
        const paymentModesResponse = await axios.get(`http://localhost:3000/api/data3/${userId}`);
        setLoading(false);
        setExpensesData({
          expenses: expensesResponse.data,
          categories: categoriesResponse.data,
          merchants: merchantsResponse.data,
          paymentModes: paymentModesResponse.data,
        });
      } catch (error) {
        setContent(masterContent["fetchError"]);
        setPopupState(true);
      }
    };
 
    fetchData();
  }, [userId]);
  //create charts
  useEffect(() => {
    if (expensesData.expenses) {
      if(selection === 1)
        createLineChart('chart', expensesData.expenses, 'date', 'amount');
      if(selection === 2)
        createBarChart('chart', expensesData.merchants, 'merchant', 'amount');
      if(selection === 3)
        createPieChart('chart', expensesData.paymentModes, 'paymentMode', 'totalAmount');
    }
 
    // Cleanup function to destroy chart instances
    return () => {
      Object.values(chartRefs).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [expensesData, selection]);
  //Date transformation
  function tranform_date(date) {
    
    if(date !== undefined)
    {
      return date.slice(0, 10);
    }
      
    else
      return "";
  }

  function date_sort(a, b) {
    return new Date(a.date) - new Date(b.date);
}
 //Creates line chart on canvas by passing expense data, label and value.
  const createLineChart = (canvasId, data, labelKey, valueKey) => {
    for(var i = 0; i < data.length; i++)
    {
      data[i].date = tranform_date(data[i].date);

    }
    data = data.reduce((accumulator, current) => {
      if (accumulator[current.date]) {
        accumulator[current.date].amount += current.amount;
      } else {
        accumulator[current.date] = { date: current.date, amount: current.amount };
      }
      return accumulator;
    }, {});
    var temp = [];
    for(const row in data)
      temp.push(data[row]);
    data = temp;
    data = data.sort(date_sort);
      
    const ctx = document.getElementById(canvasId).getContext('2d');
    document.getElementById(canvasId).width = 700;
    document.getElementById(canvasId).height = 500;
    if (chartRefs[canvasId]) {
      chartRefs[canvasId].destroy();
    }
    chartRefs[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item[labelKey]),
        datasets: [{
          label: 'Total expenses on day',
          data: data.map(item => item[valueKey]),
          backgroundColor: 'rgba(75,   192,   192,   0.2)',
          borderColor: 'rgba(75,   192,   192,   1)',
          borderWidth:   1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false 
          },
          title: {
            display: true,
            text: 'Expenses By Date' 
          },
        }
      }
    });
  };

  
 //Creates bar chart on canvas by passing expense data, label and value.
  const createBarChart = (canvasId, data, labelKey, valueKey) => {
    const colors = ['rgba(120,  28,  129,  1)', 'rgba(107,  178,  140,  1)', 'rgba(72,  139,  194,  1)', 'rgba(217,  33,  32,  1)'];
    const ctx = document.getElementById(canvasId).getContext('2d');
    document.getElementById(canvasId).width = 700;
    document.getElementById(canvasId).height = 500;
    
    data = data.reduce((accumulator, current) => {
      if (accumulator[current.merchant]) {
        accumulator[current.merchant].amount += current.amount;
      } else {
        accumulator[current.merchant] = { merchant: current.merchant, amount: current.amount };
      }
      return accumulator;
    }, {});
    var temp = [];
    for(const row in data)
      temp.push(data[row]);
    data = temp;
    

    

    if (chartRefs[canvasId]) {
      chartRefs[canvasId].destroy();
    }
    chartRefs[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item[labelKey]),
        datasets: [{
          data: data.map(item => item[valueKey]),
          backgroundColor: data.map((item, index) => {
            return colors[index % colors.length];
          }),
          borderColor: 'rgba(0,   0,   0,   1)',
          borderWidth:   1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Expenses by Merchant'
          },
        }
      }
    });
    // console.log(`Bar chart for ${canvasId} created`);
  };
 
 
 
  const createPieChart = (canvasId, data, labelKey, valueKey) => {
    const colors = ['rgba(120,  28,  129,  1)', 'rgba(107,  178,  140,  1)', 'rgba(72,  139,  194,  1)', 'rgba(217,  33,  32,  1)'];

    const ctx = document.getElementById(canvasId).getContext('2d');
    document.getElementById(canvasId).width = 500;
    document.getElementById(canvasId).height = 500;
    if (chartRefs[canvasId]) {
      chartRefs[canvasId].destroy();
    }
    chartRefs[canvasId] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(item => item[labelKey]),
        datasets: [{
          data: data.map(item => item[valueKey]),
          backgroundColor: data.map((item, index) => {
            return colors[index % colors.length];
          }),
          borderColor: 'rgba(255,   255,   255,   1)',
          borderWidth:   1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Expenses by payment mode'
          },
        }
      },
      
      
    });
    // console.log(`Pie chart for ${canvasId} created`);
  };
 
  return (
    <div className="analytics-container">
      <div className='button-anal-div'>
      <button type="button" class="btn btn-outline-danger button-anal" onClick={()=> {setSelection(1)}}>Line Chart</button>
      <button type="button" class="btn btn-outline-danger button-anal" onClick={()=> {setSelection(2)}}>Bar Chart</button>
      <button type="button" class="btn btn-outline-danger button-anal" onClick={()=> {setSelection(3)}}>Pie Chart</button>
      </div>

      <SpinnerComponent state={loading} setState={setLoading}/>
      <PopupModal state={popupState} setState={handlePopupState} content={content}/>
      <div className="chart-row">
        <div className="chart-column">
          <canvas id="chart" style={{ "position": "relative"}} className="chart" st></canvas>
        </div>
      </div>
    </div>
  );
};
 
export default Analytics;