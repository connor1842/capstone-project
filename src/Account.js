import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import ModalForm from "./ModalForm";
import AxiosGetter from "./AxiosGetter";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
const axios = require("axios");

class Account extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      dataStatus: "NO_MSG",
      requestStatus: "NO_MSG",
      responseMessage: "",
      showAddTenantModal: false,
      showAddGuestModal: false,
      showEditModal: false,
      showPasswordModal: false,
      showDeleteModal: false,
      userList: [],
      currentID: -1
    };
    this.initData = this.initData.bind(this);
    this.dataFailed = this.dataFailed.bind(this);
    this.sendEditUser = this.sendEditUser.bind(this);
    this.updateUsers = this.updateUsers.bind(this);
    this.toggleEditUser = this.toggleEditUser.bind(this);
    this.togglePasswordModal = this.togglePasswordModal.bind(this);
    this.EditModal = this.EditModal.bind(this);
    this.PasswordModal = this.PasswordModal.bind(this);
    this.CreateRow = this.CreateRow.bind(this);
    this.MyUserRows = this.MyUserRows.bind(this);
    this.ConditionalRender = this.ConditionalRender.bind(this);

    //imported functions
    this.getSuccessMessage = getSuccessMessage.bind(this);
    this.getErrorMessage = getErrorMessage.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") !== "true")
      this.props.history.push("/Login");
    const route = "users/" + localStorage.getItem("userID");
    AxiosGetter(route, this.initData, this.dataFailed);
  }

  initData(data) {
    const newUser = [
      {
        username: data.username,
        Email: data.email,
        Phone: data.phone,
        Password: "",
        admin: data.admin ? "yes" : "no",
        id: data.id,
        user_id: 0
      }
    ];
    this.setState({
      userList: [...newUser],
      dataStatus: "SUCCESS"
    });
  }

  dataFailed() {
    this.setState({
      dataStatus: "FAILED"
    });
  }

  sendEditUser(user) {
    let payload;
    if (user.hasOwnProperty("Current Password")) {
      payload = {
        old_password: user["Current Password"],
        new_password: user["New Password"]
      };
    } else {
      payload = {
        email: user.Email,
        phone: user.Phone
      };
    }
    const putUser = async data => {
      axios
        .put(
          "https://felis-234504.appspot.com/users/" +
            localStorage.getItem("userID"),
          data,
          {
            headers: { Authorization: localStorage.getItem("access_token") }
          }
        )
        .then(response => {
          this.getSuccessMessage(response);
          AxiosGetter(
            "users/" + localStorage.getItem("userID"),
            this.initData,
            this.dataFailed
          );
          console.log("completed send");
        })
        .catch(err => {
          this.getErrorMessage(err);
          console.log(err);
        });
    };

    return putUser(payload).then(function(response) {
      return response;
    });
  }

  updateUsers(newUser) {
    let usersCopy = [...this.state.userList];
    usersCopy[newUser.user_id] = { ...newUser };
    this.setState({ userList: usersCopy, currentID: -1 });
  }

  toggleEditUser(event, userID) {
    this.setState(state => ({
      showEditModal: !state.showEditModal,
      currentID: userID,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
    console.log(this.state.userList);
  }

  togglePasswordModal() {
    this.setState(state => ({
      showPasswordModal: !state.showPasswordModal,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  EditModal(props) {
    if (!props.show) return null;
    const thisUser = { ...this.state.userList[props.newID] };
    const object = {
      Email: thisUser["Email"],
      Phone: thisUser["Phone"]
    };
    return (
      <ModalForm
        Object={object}
        onCancel={event => this.toggleEditUser(event, props.newID)}
        onUpdateObjects={this.updateUsers}
        onSend={this.sendEditUser}
        formType={"edit"}
        formTitle={"Edit User"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  PasswordModal(props) {
    if (!props.show) return null;
    return (
      <ModalForm
        Object={{
          "Current Password": "",
          "New Password": "",
          "Confirm Password": ""
        }}
        onCancel={() => this.togglePasswordModal()}
        onUpdateObjects={this.updateUsers}
        onSend={this.sendEditUser}
        formType={"edit"}
        formTitle={"Change Password"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  CreateRow(props) {
    return (
      <div className="accountRowHome">
        <table>
          <tbody>
            <tr>
              <td className="imageColUser">
                <img
                  src={require("./img/avatar.png")}
                  alt="car"
                  className="avatarSize"
                />
              </td>
              <div className="vertical-spacer-small" />
              <td className="headerColUser">
                <ul>User:</ul>
                <ul>Email:</ul>
                <ul>Phone:</ul>
                <ul>Admin:</ul>
              </td>
              <td className="infoColUser">
                <ul>{props.userRow.username}</ul>
                <ul>{props.userRow.Email}</ul>
                <ul>{props.userRow.Phone}</ul>
                <ul className="admin-user-text">{props.userRow.admin}</ul>
              </td>
              <td className="buttonColUser">
                <button
                  className="cogButton"
                  onClick={event =>
                    this.toggleEditUser(event, props.userRow.user_id)
                  }
                >
                  <FontAwesomeIcon icon="cog" size="1x" color="#fff" />
                </button>
                <button
                  className="keyButton"
                  onClick={() => this.togglePasswordModal()}
                >
                  <FontAwesomeIcon icon="key" size="1x" color="#fff" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  MyUserRows(props) {
    const Account = props.updatedUsers.map(user => (
      <div id="myTable" key={user.id}>
        <this.CreateRow userRow={user} />
      </div>
    ));
    return <span>{Account}</span>;
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
      <table>
        <tbody>
          <tr>
            <td>
              <this.EditModal
                show={this.state.showEditModal}
                newID={this.state.currentID}
              />
              <this.PasswordModal show={this.state.showPasswordModal} />
              <this.MyUserRows updatedUsers={this.state.userList} />
            </td>
          </tr>
        </tbody>
      </table>
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
                <FontAwesomeIcon icon="user-circle" size="2x" color="#1E88E5" />
              </div>
              <a className="header-text">Account</a>
            </div>
            <div className="AccountPageBody">
              <div className="scrollBody">
                <div className="modalFormAccount">
                  <h2 className="modalHeaderAccount">
                    <b>Account Info</b>
                  </h2>
                  <div>
                    <div>
                      <this.ConditionalRender
                        dataStatus={this.state.dataStatus}
                      />
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

export default Account;
