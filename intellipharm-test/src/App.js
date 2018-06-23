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

    console.log(dataFiltered)

    this.setState({ filteredData: dataFiltered });
    this.setState({ graphData: this.signupsPerYear(dataFiltered) })
  }

  triggerSearch(e) {
    this.resetGraphTableData(e.target.value);
  }
  resetGraphTableData(value) {
    console.log(value)
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
    data.map(element => (
      !!signPerYr[new Date(Date.parse(element.joined_date)).getFullYear()] === true
      ? signPerYr[new Date(Date.parse(element.joined_date)).getFullYear()] = signPerYr[new Date(Date.parse(element.joined_date)).getFullYear()] + 1
      : signPerYr[new Date(Date.parse(element.joined_date)).getFullYear()] = 1
    ));
    return signPerYr;
  }

  render() {



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
              datasets: [
              {
                label: 'Signup Year (count)',
                backgroundColor: randomColor(),
                borderColor: randomColor(),
                borderWidth: 1,
                hoverBackgroundColor: randomColor(),
                hoverBorderColor: randomColor(),
                data: this.state.graphData !== null ? Object.values(this.state.graphData) : []
              }
            ]}}
           height={500}
           options={{
            maintainAspectRatio: false
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
