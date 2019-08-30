import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import HomeVehicle from "./HomeVehicle";
import HomeActivity from "./HomeActivity";
import HomeAddress from "./HomeAddress";
import HomeMessage from "./HomeMessage";
import AxiosGetter from "./AxiosGetter";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

class Home extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      dataStatus: "NO_MSG"
    };
    this.initData = this.initData.bind(this);
    this.dataFailed = this.dataFailed.bind(this);
    this.WidgetRender = this.WidgetRender.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") !== "true")
      this.props.history.push("/Login");
    const route = "users/" + localStorage.getItem("userID") + "/home";
    AxiosGetter(route, this.initData, this.dataFailed);
  }

  initData(initialData) {
    this.setState({
      data: initialData,
      dataStatus: "SUCCESS"
    });
  }

  dataFailed() {
    this.setState({
      dataStatus: "FAILED"
    });
  }

  WidgetRender(props) {
    if (props.dataStatus === "NO_MSG") return null;
    else if (props.dataStatus === "FAILED") {
      return (
        <div>
          <h2>Failed to get data</h2>
        </div>
      );
    }
    return (
      <tbody>
        <tr>
          <td>
            <HomeAddress data={this.state.data.address_widget} />
          </td>
          <td>
            <HomeVehicle data={this.state.data.vehicles_widget} />
          </td>
        </tr>
        <tr>
          <td>
            <HomeActivity data={this.state.data.vehicles_widget} />
          </td>
          <td>
            <HomeMessage data={this.state.data.messages_widget} />
          </td>
        </tr>
      </tbody>
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
                <FontAwesomeIcon icon="home" size="2x" color="#212121" />
              </div>
              <a className="header-text">Home</a>
            </div>
            <div className="homeBody">
              <table className="homeTable">
                <this.WidgetRender dataStatus={this.state.dataStatus} />
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
