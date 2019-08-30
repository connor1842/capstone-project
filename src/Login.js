import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback
} from "reactstrap";

class Login extends React.Component {
  static propTypes = {
    onChangeState: PropTypes.func,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      validate: {
        emailState: ""
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") === "true")
      this.props.history.push("/Home");
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
    console.log("submitted");
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
            localStorage.setItem("is_admin", res.data.admin);
            localStorage.setItem("is_loggedIn", true);
            // redirect to main page
            console.log("Success!");
            this.props.history.push("/Home");
          }
        }
      })
      .catch(err => {
        let lbl = document.getElementById("error");
        lbl.innerText = err.response.data.error;
      });
  }

  render() {
    const { email, password } = this.state;
    return (
      <Container fluid>
        <div className="row no-gutter">
          <div className="col-md-6 bg-gray">
            <div className="text-white d-md-flex align-items-center h-100 p-5 text-center justify-content-center">
              <div className="pt-5 pb-5">
                <div className="logo-section">
                  <img
                    className="logo-image"
                    src={require("./img/logo-small.png")}
                    alt="logo"
                  />
                  <a className="logo-text">MYGARAGE</a>
                </div>
                <h5 className="logo-padding">
                  <span>
                    Simple{" "}
                    <i className="cc1">
                      <FontAwesomeIcon icon="smile" size="1x" />
                    </i>{" "}
                    |{" "}
                  </span>
                  <span>
                    Dependable{" "}
                    <i className="cc2">
                      <FontAwesomeIcon icon="shield-alt" size="1x" />
                    </i>{" "}
                    |{" "}
                  </span>{" "}
                  <span>
                    Secure{" "}
                    <i className="cc3">
                      <FontAwesomeIcon icon="lock" size="1x" />
                    </i>
                  </span>
                </h5>
              </div>
            </div>
          </div>

          <div className="col-6 bg-white">
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
                      </FormGroup>
                      <button
                        className="btn btn-md btn-garage  text-uppercase mb-2"
                        onClick={this.submitForm}
                        type="submit"
                      >
                        Sign in
                      </button>
                      <small className="d-block mt-4 text-center form-border">
                        <a
                          className="text-gray"
                          href=""
                          onClick={e => {
                            e.preventDefault();
                            this.props.history.push("/ForgotPassword");
                          }}
                        >
                          Forgot Password?
                        </a>
                        <br />
                        {/* } <a
                          className="text-gray"
                          href=""
                          onClick={e => {
                            e.preventDefault();
                            this.props.history.push("/Register");
                          }}
                        >
                          Register Account
                        </a> */}
                      </small>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }
}

export default Login;
