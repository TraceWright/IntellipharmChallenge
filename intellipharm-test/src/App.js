import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
        apiData: [],
        currentPage: 1,
        itemsPerPage: 100,
        inputText: '',
      }
    }

  filterApiData = (data, targetValue) => {

    const searchString = new RegExp(targetValue, 'g')
    const searchStringCapitalised = targetValue.charAt(0).toUpperCase()  + targetValue.slice(1);
    
    const result = data.filter((element) => {
      return element.firstname.match(searchStringCapitalised) !== null
        || element.firstname.match(searchString) !== null
        || element.surname.match(searchStringCapitalised) !== null
        || element.surname.match(searchString) !== null
        || element.email.match(searchString) !== null
        ? element.firstname : null
    });

    console.log(result);
  }

  handleTextChange = (event) => {
    this.setState({ inputText: event.target.value });


    this.filterApiData(this.state.apiData, event.target.value);
  }

  handleClick = (event) => {
    this.setState({
      currentPage: Number(event.target.id)
    });
  }

  getDataFiltered = (data) => {
    axios.get('https://intellipharm.com.au/devtest/index.php', { params: {
      firstname: "Reggy",
    }
  })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  componentWillMount = () => {
    axios.get('https://intellipharm.com.au/devtest/index.php')
      .then((response) => (
        this.setState({ apiData: response.data })
      ))
      .catch((error) => (
        console.log(error)
      ));
  }


  render() {

    // console.log(this.state.apiData);

    const { apiData, currentPage, itemsPerPage } = this.state;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = apiData.slice(indexOfFirstItem, indexOfLastItem);

    const renderItems = currentItems.map((item) => {
      return <tr key={item.id}>
              <td>{item.firstname}</td>
              <td>{item.surname}</td>
              <td>{item.email}</td>
              <td>{item.gender}</td>
              <td>{item.joined_date}</td>
            </tr>;
    });

    const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(apiData.length / itemsPerPage); i++) {
        pageNumbers.push(i);
      }

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

        <div>
          <input
            onChange={this.handleTextChange}
            value={this.state.inputText}
          ></input>

        </div>

        <div className="data-table">
          <table>
            <tbody>
              <tr>
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
