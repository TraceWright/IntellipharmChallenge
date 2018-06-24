import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { HorizontalBar } from 'react-chartjs-2';
import { debounce } from 'throttle-debounce';
import randomColor from 'randomcolor';

class App extends Component {
  constructor(props) {
    super(props);
      this.resetGraphTableData = debounce(500, this.resetGraphTableData);
      this.state = {
        apiData: [],
        filteredData: null,
        currentPage: 1,
        itemsPerPage: 100,
        inputText: '',
        graphData: null,
      }

    }

  filterApiData = (data, targetValue) => {

    const searchString = new RegExp(targetValue, 'g')
    const searchStringCapitalised = targetValue.charAt(0).toUpperCase()  + targetValue.slice(1);
    
    const dataFiltered = data.filter((element) => {
      return element.firstname.match(searchStringCapitalised) !== null
        || element.firstname.match(searchString) !== null
        || element.surname.match(searchStringCapitalised) !== null
        || element.surname.match(searchString) !== null
        || element.email.match(searchString) !== null
        ? element.firstname : null
    });

    this.setState({ filteredData: dataFiltered });
    // console.log(dataFiltered);
    // console.log(this.signupsPerYear(dataFiltered));
    this.setState({ graphData: this.signupsPerYear(dataFiltered) })
  }

  triggerSearch(e) {
    this.resetGraphTableData(e.target.value);
  }
  resetGraphTableData(value) {
    this.filterApiData(this.state.apiData, value);
  }

  handleTextChange = (event) => {
    this.setState({ inputText: event.target.value });
  }

  handleClick = (event) => {
    this.setState({
      currentPage: Number(event.target.id)
    });
  }

  generatePageNumbers(data, itemsPerPage) {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  componentWillMount = () => {
    axios.get('https://intellipharm.com.au/devtest/index.php')
      .then((response) => (
        this.setState({ apiData: response.data }),
        this.setState({ graphData: this.signupsPerYear(response.data) })
      ))
      .catch((error) => (
        console.log(error)
      ));  
  }

  signupsPerYear = (data) => {
    let signPerYr = {};

    data.forEach(element => {
      const month = new Date(Date.parse(element.joined_date)).getMonth() + 1;
      const year = new Date(Date.parse(element.joined_date)).getFullYear();
      if (!!signPerYr[year] === false) {

        signPerYr[year] = { 
          year: 1, 
          months: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 }
        }
        signPerYr[year].months[month] = 1;
      } else {
        signPerYr[year].year = signPerYr[year].year + 1;
        signPerYr[year].months[month] = signPerYr[year].months[month] + 1;
      }
    });

    return signPerYr;
  }

  render() {

    

    const stackedObject = {
      1: {data: [], label: 'January', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      2: {data: [], label: 'February', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      3: {data: [], label: 'March', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      4: {data: [], label: 'April', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      5: {data: [], label: 'May', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      6: {data: [], label: 'June', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      7: {data: [], label: 'July', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      8: {data: [], label: 'August', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      9: {data: [], label: 'September', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      10:{data: [], label: 'October', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      11:{data: [], label: 'November', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
      12:{data: [], label: 'December', backgroundColor: randomColor(), hoverBorderColor: randomColor(),},
    }




    this.state.graphData ?
    Object.keys(this.state.graphData).map(yearKey => (
           Object.keys(this.state.graphData[yearKey].months).map(monthKey => (
              stackedObject[monthKey].data.push(this.state.graphData[yearKey].months[monthKey])
          ))
    ))
    : [];

    const { apiData, currentPage, itemsPerPage, filteredData } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData === null ? apiData.slice(indexOfFirstItem, indexOfLastItem) : filteredData.slice(indexOfFirstItem, indexOfLastItem);
    
    const renderItems = currentItems.map((item) => {
      return <tr key={item.id}>
              <td>{item.firstname}</td>
              <td>{item.surname}</td>
              <td>{item.email}</td>
              <td>{item.gender}</td>
              <td>{item.joined_date}</td>
            </tr>;
    });

    const pageNumbers = this.generatePageNumbers(filteredData === null ? apiData : filteredData, itemsPerPage);

    const renderPageNumbers = pageNumbers.map(number => {
      return (
        <li
          key={number}
          id={number}
          onClick={this.handleClick}
        >
          {number}
        </li>
      );
    });

    return (
      <div className="App">

        <div className="search-area">
          <table>
              <tbody>
                <tr>
                  <td>
                    <label>Search:</label>
                  </td>
                  <td>
                    <input
                      id="text-input"
                      onChange={this.handleTextChange}
                      value={this.state.inputText}
                      type="text"
                      onKeyUp={this.triggerSearch.bind(this)}
                    ></input>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="graph-area">
          <HorizontalBar
            data={{
              labels: this.state.graphData !== null ? Object.keys(this.state.graphData) : [],
    
            datasets: Object.keys(stackedObject).map(monthKey =>
                stackedObject[monthKey]
            )}}
            height={500}
            width={window.innerWidth - 100}
            options={{
              maintainAspectRatio: false,
              responsive: false,
              legend: {
                position: 'right'
              },
              scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true
                }]
              }
            }}
          />
        </div>

        <div className="table-area">
          <table className="data-table">
            <tbody>
              <tr className="headings">
                <td>Firstname</td>
                <td>Lastname</td> 
                <td>Email</td>
                <td>Gender</td>
                <td>Join Date</td>
              </tr>
            </tbody>
            <tbody>
              {renderItems}
            </tbody>
          </table>
        </div>

          <ul id="page-numbers">
            {renderPageNumbers}
          </ul>

      </div>
    );
  }
}

export default App;
