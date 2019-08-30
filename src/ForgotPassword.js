import React from "react";
import ModalForm from "./ModalForm";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
const axios = require("axios");

class ForgotPassword extends React.Component {
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

  cancelRegister() {
    this.props.history.push("/Login");
  }

  sendRegister(user) {
    const payload = {
      username: user["Username"],
      address: user["Address"]
    };
    console.log(payload);
    const postNewUser = async data => {
      axios
        .post("https://felis-234504.appspot.com/password", data)
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
          Username: "",
          Address: ""
        }}
        onUpdateObjects={function() {}}
        onSend={this.sendRegister}
        onCancel={event => {
          this.cancelRegister(event);
        }}
        formType={"add"}
        formTitle={"Forgot Password"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }
}

export default withRouter(ForgotPassword);
