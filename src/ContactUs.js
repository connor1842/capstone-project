import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { Label } from "reactstrap";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

class ContactUs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      message: ""
    };
  }

  handleSubmit = event => {
    event.preventDefault();

    const userID = localStorage.getItem("userID");
    const payload = {
      name: this.state.name,
      email: this.state.email,
      message: this.state.message
    };

    axios
      .post(
        "https://felis-234504.appspot.com/users/" + userID + "/contactus",
        payload,
        { headers: { Authorization: localStorage.getItem("access_token") } }
      )
      .then(response => {
        let lbl = document.getElementById("error");
        lbl.style.color = "black";
        lbl.innerText = response.data.msg;
        console.log("Success!");
      })
      .catch(err => {
        console.log(err);
        let lbl = document.getElementById("error");
        lbl.style.color = "red";
        lbl.innerText = err.response.data.error;
      });
  };

  handleChange = event => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value
    });
  };

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
                  icon="hands-helping"
                  size="2x"
                  color="#ffe0bd"
                />
              </div>
              <a className="header-text">Contact Us</a>
            </div>
            <div className="contactUsBody">
              <div className="scrollBody">
                <div className="modalForm">
                  <h2 className="modalHeaderSend">
                    <b>Contact Us</b>
                  </h2>
                  <div>
                    <div className="modalBody">
                      <input
                        placeholder="Name"
                        type="text"
                        name="name"
                        onChange={this.handleChange}
                        required
                      />
                      <input
                        placeholder="Email"
                        type="email"
                        name="email"
                        onChange={this.handleChange}
                        required
                      />
                      <div className="flex">
                        <textarea
                          placeholder="Message"
                          type="textarea"
                          name="message"
                          rows="1"
                          onChange={this.handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="modalFooterSend">
                      <button
                        className="modalButton modalButtonSend"
                        onClick={this.handleSubmit}
                      >
                        Send
                      </button>
                    </div>
                    <div>
                      <Label id="error" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContactUs;
