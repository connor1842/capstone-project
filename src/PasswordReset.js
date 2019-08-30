import React from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
import ModalForm from "./ModalForm";

class PasswordReset extends React.Component {
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
      localStorage.setItem("reset_token", registration_token);
    }
  }

  cancelRegister() {
    this.props.history.push("/Login");
  }

  sendRegister(user) {
    const payload = {
      new_password: user["New Password"],
      token: localStorage.getItem("reset_token")
    };
    console.log(payload);
    const postNewPassword = async data => {
      axios
        .put("https://felis-234504.appspot.com/password", data)
        .then(response => {
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return postNewPassword(payload).then(function(response) {
      return response;
    });
  }

  render() {
    return (
      <ModalForm
        Object={{
          "New Password": "",
          "Confirm Password": ""
        }}
        onUpdateObjects={function() {}}
        onSend={this.sendRegister}
        onCancel={event => {
          this.cancelRegister(event);
        }}
        formType={"add"}
        formTitle={"Reset Password"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }
}

export default PasswordReset;
