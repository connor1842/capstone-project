import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

class Navbar extends React.Component {
  static propTypes = {
    onChangeState: PropTypes.func,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.changeView = this.changeView.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
    this.signOut = this.signOut.bind(this);
    this.LogoText = this.LogoText.bind(this);
  }
  changeView(event, newView) {
    event.preventDefault();
    this.props.onChangeState(newView);
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  signOut(e) {
    e.preventDefault();
    axios
      .post("https://felis-234504.appspot.com/logout", null, {
        headers: { Authorization: localStorage.getItem("access_token") }
      })
      .then(res => {
        console.log("log out successful");
        localStorage.removeItem("access_token");
        localStorage.removeItem("userID");
        localStorage.removeItem("is_loggedIn");
        window.location.reload();
        console.log(res);
        this.props.history.push("/Login");
      })
      .catch(err => {
        console.log(err);
      });
  }

  LogoText() {
    if (localStorage.getItem("is_admin") === "true")
      return (
        <b className="side-logo-text">
          MyGarage
          <span id="admin_label" className="adminLabel">
            Admin
          </span>
        </b>
      );
    else return <b className="side-logo-text">MyGarage</b>;
  }

  render() {
    return (
      <nav className="navbar custom-navbar navbar-light navbar-expand-md bg-faded justify-content-center">
        <div className="navbar-nav w-100 justify-content-left">
          <a
            className="navbar-brand"
            href=""
            onClick={() => this.props.history.push("home")}
          >
            <b href="" className="navbar-logo-normal">
              <img
                src={require("./img/logo-small.png")}
                width="30px"
                alt="navbar logo"
              />
              <this.LogoText />
            </b>
          </a>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#collapsingNavbar3"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="navbar-collapse collapse w-100" id="collapsingNavbar3">
          <ul className="nav navbar-nav ml-auto w-100 justify-content-end">
            <li className="nav-item">
              <a
                className="nav-link2"
                href=""
                onClick={() => this.props.history.push("/FAQ")}
              >
                FAQ
              </a>
            </li>{" "}
            <li className="nav-item">
              <a
                className="nav-link2"
                href=""
                onClick={() => this.props.history.push("/ContactUs")}
              >
                CONTACT US
              </a>
            </li>{" "}
            <li className="nav-item hidden-nav">
              <a
                className="nav-link2"
                href=""
                onClick={() => this.props.history.push("/Account")}
              >
                ACCOUNT
              </a>
            </li>{" "}
            <li className="nav-item hidden-nav">
              <a
                className="nav-link2"
                href=""
                onClick={event => {
                  this.signOut(event);
                }}
              >
                SIGN OUT
              </a>
            </li>{" "}
            <li className="nav-item">
              <div className="dropdown">
                <a
                  className="nav-link2 dropdown-toggle"
                  href=""
                  id="navbardrop"
                  data-toggle="dropdown"
                >
                  <FontAwesomeIcon icon="user-circle" />
                </a>

                <div className="dropdown-menu">
                  <a
                    className="dropdown-item"
                    href=""
                    onClick={event => {
                      event.preventDefault();
                      this.props.history.push("/Account");
                    }}
                  >
                    Account
                  </a>
                  <a
                    className="dropdown-item"
                    href=""
                    onClick={event => {
                      this.signOut(event);
                    }}
                  >
                    Sign Out
                  </a>
                </div>
              </div>{" "}
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default withRouter(Navbar);
