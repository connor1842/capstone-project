import React from "react";
import ModalForm from "./ModalForm";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
const axios = require("axios");

class RegisterUser extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      requestStatus: "NO_MSG",
      responseMessage: ""
    };
    this.sendRegister = this.sendRegister.bind(this);
    this.cancelRegister = this.cancelRegister.bind(this);

    //imported functions
    this.getSuccessMessage = getSuccessMessage.bind(this);
    this.getErrorMessage = getErrorMessage.bind(this);
  }
  componentDidMount() {
    const url = window.location.href;
    if (url.indexOf("token=") >= 0) {
      let registration_token = url.substring(
        url.indexOf("token=") + 6,
        url.length
      );
      localStorage.setItem("registration_token", registration_token);
    }
  }

  cancelRegister() {
    this.props.history.push("/Login");
  }

  sendRegister(user) {
    const payload = {
      email: user["Email"],
      username: user["Username"],
      password: user["Password"],
      phone: user["Phone"],
      token: localStorage.getItem("registration_token")
    };
    console.log(payload);
    const postNewUser = async data => {
      axios
        .post("https://felis-234504.appspot.com/users", data)
        .then(response => {
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return postNewUser(payload).then(function(response) {
      return response;
    });
  }

  render() {
    return (
      <ModalForm
        Object={{
          Email: "",
          Username: "",
          Phone: "",
          Password: "",
          "Confirm Password": ""
        }}
        onUpdateObjects={function() {}}
        onSend={this.sendRegister}
        onCancel={event => {
          this.cancelRegister(event);
        }}
        formType={"add"}
        formTitle={"Create Account"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }
}

export default withRouter(RegisterUser);
