import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import AxiosGetter from "./AxiosGetter";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

class Activity extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      dataStatus: "NO_MSG",
      daysInView: "14",
      plate_filter: "",
      from_date: "",
      to_date: ""
    };
    this.initData = this.initData.bind(this);
    this.dataFailed = this.dataFailed.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handlePlateChange = this.handlePlateChange.bind(this);
    this.AddRecord = this.AddRecord.bind(this);
    this.FilterBar = this.FilterBar.bind(this);
    this.ConditionalRender = this.ConditionalRender.bind(this);
    this.matchesPlate = this.matchesPlate.bind(this);
    this.matchesDates = this.matchesDates.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") !== "true")
      this.props.history.push("/Login");
    const route = "/entries";
    AxiosGetter(route, this.initData, this.dataFailed);
  }

  initData(initialData) {
    let initEntries = [];
    for (var i = 0; i < initialData.length; i++) {
      const curEntry = {
        Address: initialData[i].address ? initialData[i].address : "None",
        Plate: initialData[i].plate_number
          ? initialData[i].plate_number
          : "None",
        State: initialData[i].state ? initialData[i].state : "None",
        Color: initialData[i].color ? initialData[i].color : "None",
        Vehicle_Type: initialData[i].type ? initialData[i].type : "None",
        Guest: initialData[i].guest === true ? "Yes" : "No",
        Date: initialData[i].timestamp ? initialData[i].timestamp : "None"
      };
      initEntries.push(curEntry);
    }
    this.setState({
      entries: [...initEntries],
      dataStatus: "SUCCESS"
    });
  }

  dataFailed() {
    this.setState({
      dataStatus: "FAILED"
    });
  }

  handleDateChange(event, type) {
    if (type === "from") {
      this.setState({ from_date: event.target.value });
    } else if (type === "to") {
      this.setState({ to_date: event.target.value });
    }
  }

  handlePlateChange(event) {
    this.setState({ plate_filter: event.target.value });
  }

  matchesPlate(plate) {
    if (this.state.plate_filter.length === 0) return true;
    if (!plate) return false;
    const lower = plate.toLowerCase();
    if (lower.indexOf(this.state.plate_filter.toLowerCase()) !== -1)
      return true;
    return false;
  }

  matchesDates(date) {
    if (this.state.from_date.length === 0 && this.state.to_date.length === 0)
      return true;
    let reformatted = date.substring(0, date.indexOf(",")).replace(/\//g, "-");
    reformatted =
      reformatted.substring(
        reformatted.lastIndexOf("-") + 1,
        reformatted.length
      ) +
      "-" +
      reformatted.substring(0, reformatted.lastIndexOf("-"));
    console.log("Reformatted: " + reformatted);
    console.log("From date:   " + this.state.from_date);
    console.log("To Date:     " + this.state.to_date);
    let inRange = false;
    if (
      this.state.from_date.length === 0 ||
      reformatted >= this.state.from_date
    )
      inRange = true;
    if (!(this.state.to_date.length === 0 || reformatted <= this.state.to_date))
      inRange = false;
    return inRange;
  }

  AddRecord(props) {
    const filteredActivities = props.activities.filter(
      record =>
        this.matchesPlate(record.Plate) && this.matchesDates(record.Date)
    );
    const activityList = filteredActivities.map(record => (
      <div className="activityRow" key={record.id}>
        <table>
          <tbody>
            <tr>
              <td className="imageCol3">
                <img
                  src={require("./img/temp/blackcivic.jpeg")}
                  width="100px"
                  alt="car"
                />
              </td>
              <td className="headerCol3">
                <ul>Address: </ul>
                <ul>Plate: </ul>
                <ul>State: </ul>
                <ul>Color: </ul>
                <ul>Type: </ul>
                <ul>Guest: </ul>
                <ul>Date: </ul>
              </td>
              <td className="infoCol3">
                <ul>{record.Address}</ul>
                <ul>{record.Plate}</ul>
                <ul>{record.State}</ul>
                <ul>{record.Color}</ul>
                <ul>{record.Vehicle_Type}</ul>
                <ul>{record.Guest}</ul>
                <ul>{record.Date}</ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ));
    return (
      <div id="activityBody" className="pageBody">
        {activityList}
      </div>
    );
  }

  FilterBar(props) {
    return (
      <div className="filterBar">
        <label htmlFor="plateFilter">Search By Plate: </label>
        <input
          name="plate_filter"
          type="text"
          value={props.curPlate}
          onChange={event => {
            this.handlePlateChange(event);
          }}
        />
        <label htmlFor="FromDate">From: </label>
        <input
          name="FromDate"
          type="date"
          value={props.fromDate}
          onChange={event => {
            this.handleDateChange(event, "from");
          }}
        />
        <label htmlFor="ToDate">To: </label>
        <input
          name="ToDate"
          type="date"
          value={props.toDate}
          onChange={event => {
            this.handleDateChange(event, "to");
          }}
        />
      </div>
    );
  }

  ConditionalRender(props) {
    if (props.dataStatus === "NO_MSG") return null;
    else if (props.dataStatus === "FAILED") {
      return (
        <div>
          <h2>Failed to get data</h2>
        </div>
      );
    }
    return (
      <div>
        <this.AddRecord activities={this.state.entries} />
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>
          <Navbar />
          <Sidebar />
        </div>
        <div id="wrapper">
          <div id="main-wrapper">
            <div className="header">
              <div className="header-icon">
                <FontAwesomeIcon
                  icon="calendar-alt"
                  size="2x"
                  color="#5E35B1"
                />
              </div>
              <a className="header-text">Activity</a>
            </div>
            <div id="ActivitiesBody" className="activityBody">
              <this.FilterBar
                curPlate={this.state.plate_filter}
                fromDate={this.state.from_date}
                toDate={this.state.to_date}
              />
              <div className="activitySpacer" />
              <div className="scrollBody">
                <this.ConditionalRender dataStatus={this.state.dataStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Activity;
