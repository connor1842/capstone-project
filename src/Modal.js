import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { Modal, Form, FormGroup, Label, Input, FormFeedback } from "reactstrap";

class ModalExample extends React.Component {
  static propTypes = {
    onChangeState: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      validate: {
        emailState: ""
      },
      dd1: false,
      modal: true
    };
    this.changeView = this.changeView.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  changeView(newView) {
    this.props.onChangeState(newView);
  }

  validateEmail(e) {
    const emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const { validate } = this.state;
    if (emailRex.test(e.target.value)) {
      validate.emailState = "has-success";
    } else {
      validate.emailState = "has-danger";
    }
    this.setState({ validate });
  }

  handleChange = async event => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [name]: value
    });
  };

  submitForm(e) {
    e.preventDefault();
    const payload = {
      username: this.state.email,
      password: this.state.password
    };
    axios
      .post("https://felis-234504.appspot.com/login", payload)
      .then(res => {
        if (res.data.hasOwnProperty("access_token")) {
          localStorage.setItem("access_token", res.data.access_token);
          if (res.data.hasOwnProperty("userID")) {
            localStorage.setItem("userID", res.data.userID);
            let lbl = document.getElementById("error");
            lbl.innerText = "";
            console.log("Success!");
            this.changeView("account");
          }
        }
      })
      .catch(err => {
        let lbl = document.getElementById("error");
        lbl.innerText = err.response.data.error;
      });
  }

  dropdownToggle() {
    this.setState({
      dd1: !this.state.dd1
    });
  }
  closeModal(tabId) {
    this.setState({
      [tabId]: false
    });
  }
  showModal(modal) {
    this.setState({
      [modal]: true
    });
  }

  render() {
    const { email, password } = this.state;
    return (
      <Modal
        isOpen={this.state.modal}
        toggle={this.closeModal.bind(this, "modal")}
      >
        <div className="row no-gutter modal-full" fluid>
          <div className="col-md-6 bg-gray">
            <div className="text-white d-md-flex align-items-center h-100 p-5 text-center justify-content-center">
              <div className="pt-5 pb-5">
                <p className="logo-image">
                  <i className="logo-padding color1">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                  <i className="logo-padding color2">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                  <i className="logo-padding color3">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                  <i className="logo-padding color4">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                  <i className="logo-padding color5">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                  <i className="logo-padding color6">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                  <i className="logo-padding color7">
                    <FontAwesomeIcon icon="car" size="2x" />
                  </i>
                </p>
                <h1 className="mb-0 mt-3 display-2 logo-text">
                  <span className="gold">MY</span>
                  <span className="white">Garage</span>
                </h1>
                <h5 className="logo-padding2 font-weight-light">
                  <span>
                    Simple{" "}
                    <i className="color5">
                      <FontAwesomeIcon icon="smile" size="1x" />
                    </i>{" "}
                    |{" "}
                  </span>
                  <span>
                    Dependable{" "}
                    <i className="color7">
                      <FontAwesomeIcon icon="shield-alt" size="1x" />
                    </i>{" "}
                    |{" "}
                  </span>{" "}
                  <span>
                    Secure{" "}
                    <i className="color2">
                      <FontAwesomeIcon icon="lock" size="1x" />
                    </i>
                  </span>
                </h5>
              </div>
            </div>
          </div>
          <div className="col-6 bg-white">
            <button
              type="button"
              className="close modal-close"
              aria-label="Close"
              onClick={this.closeModal.bind(this, "modal")}
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="login d-flex align-items-center py-5">
              <div className="container">
                <div className="row">
                  <div className="col-md-7 col-lg-5 mx-auto">
                    <Form>
                      <div>
                        <Label id="error" />
                      </div>
                      <FormGroup>
                        <div className="form-label-group">
                          <Input
                            type="email"
                            name="email"
                            id="exampleEmail"
                            placeholder="Email"
                            value={email}
                            valid={
                              this.state.validate.emailState === "has-success"
                            }
                            invalid={
                              this.state.validate.emailState === "has-danger"
                            }
                            onChange={e => {
                              this.validateEmail(e);
                              this.handleChange(e);
                            }}
                          />
                          <FormFeedback valid />
                          <FormFeedback />
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <div className="form-label-group">
                          <Input
                            type="password"
                            name="password"
                            id="examplePassword"
                            placeholder="Password"
                            value={password}
                            onChange={e => this.handleChange(e)}
                          />
                        </div>
                        <div className="mb-3">
                          <Label check>
                            <Input type="checkbox" /> Remember me
                          </Label>
                        </div>
                      </FormGroup>
                      <div className="btn-center">
                        <button
                          className="btn btn-lg btn-garage btn-block btn-login text-uppercase font-weight-bold mb-2 btn-center"
                          onClick={this.submitForm}
                          type="submit"
                        >
                          Login
                        </button>
                      </div>
                      <small className="d-block mt-4 text-center form-border">
                        <a
                          className="text-gray"
                          href="#"
                          onClick={e => {
                            e.preventDefault;
                            this.changeView("PasswordReset");
                          }}
                        >
                          Forgot Password?
                        </a>
                      </small>
                      <small className="d-block mt-4 text-center text-bold">
                        Dont have an account?{" "}
                        <a className="text-gold" href="">
                          Register
                        </a>
                      </small>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ModalExample;
