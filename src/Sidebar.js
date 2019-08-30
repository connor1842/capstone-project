import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import WeatherBar from "./WeatherBar";

class Sidebar extends React.Component {
  static propTypes = {
    onChangeState: PropTypes.func,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.changeView = this.changeView.bind(this);
    this.ShowCommunity = this.ShowCommunity.bind(this);
  }

  changeView(event, route) {
    event.preventDefault();
    this.props.history.push(route);
  }
  ShowCommunity() {
    if (localStorage.getItem("is_admin") === "true") {
      return (
        <li>
          <a
            href=""
            onClick={event => {
              this.changeView(event, "/Community");
            }}
          >
            <FontAwesomeIcon icon="building" size="2x" color="#F44336" />
            <b className="nav-text">Community</b>
          </a>
        </li>
      );
    } else return null;
  }
  render() {
    return (
      <div id="wrapper">
        <div id="sidebar-wrapper">
          <div className="logo">
            <a
              href=""
              onClick={() => {
                this.changeView("/Home");
              }}
              className="logo-normal"
            >
              Menu
            </a>
          </div>
          <ul className="sidebar-nav">
            <li>
              <a
                href=""
                onClick={event => {
                  this.changeView(event, "/Home");
                }}
              >
                <FontAwesomeIcon icon="home" size="2x" color="#212121" />
                <b className="nav-text">Home</b>
              </a>
            </li>{" "}
            <li>
              <a
                href=""
                onClick={event => {
                  this.changeView(event, "/Vehicles");
                }}
              >
                <FontAwesomeIcon icon="car" size="2x" color="#00C853" />
                <b className="nav-text">Vehicle</b>
              </a>
            </li>{" "}
            <li>
              <a
                href=""
                onClick={event => {
                  this.changeView(event, "/Activity");
                }}
              >
                <FontAwesomeIcon
                  icon="calendar-alt"
                  size="2x"
                  color="#7E57C2"
                />
                <b className="nav-text">Activity</b>
              </a>
            </li>{" "}
            <li>
              <a
                href=""
                onClick={event => {
                  this.changeView(event, "/Messages");
                }}
              >
                <FontAwesomeIcon icon="envelope" size="2x" color="#fff" />
                <b className="nav-text">Message</b>
              </a>
            </li>{" "}
            <this.ShowCommunity />
            <div className="weatherBarWrapper">
              <WeatherBar />
            </div>
          </ul>
        </div>
        <div id="main-wrapper" />
      </div>
    );
  }
}

export default withRouter(Sidebar);
