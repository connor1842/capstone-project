import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import ModalForm from "./ModalForm";
import AxiosGetter from "./AxiosGetter";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
const axios = require("axios");

class Messages extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      dataStatus: "NO_MSG",
      showAddMessage: false,
      showEditMessage: false,
      showDeleteMessage: false,
      curIndex: -1,
      requestStatus: "NO_MSG",
      responseMessage: "",
      is_admin: localStorage.getItem("is_admin") === "true" ? true : false
    };
    this.initData = this.initData.bind(this);
    this.dataFailed = this.dataFailed.bind(this);
    this.initializeState = this.initializeState.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.sendNewMessage = this.sendNewMessage.bind(this);
    this.sendDeleteMessage = this.sendDeleteMessage.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.toggleAddMessage = this.toggleAddMessage.bind(this);
    this.toggleDeleteMessage = this.toggleDeleteMessage.bind(this);
    this.AddModal = this.AddModal.bind(this);
    this.DeleteModal = this.DeleteModal.bind(this);
    this.CreateRow = this.CreateRow.bind(this);
    this.ShowMessages = this.ShowMessages.bind(this);
    this.SendMessageBtn = this.SendMessageBtn.bind(this);
    this.sortByDate = this.sortByDate.bind(this);
    this.ConditionalRender = this.ConditionalRender.bind(this);

    //imported functions
    this.getSuccessMessage = getSuccessMessage.bind(this);
    this.getErrorMessage = getErrorMessage.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") !== "true")
      this.props.history.push("/Login");
    const route = "users/" + localStorage.getItem("userID") + "/messages";
    AxiosGetter(route, this.initData, this.dataFailed);
  }

  initData(data) {
    const init_messages = [];
    for (let i = 0; i < data.length; i++) {
      const newMessage = {
        subject: data[i].subject,
        message: data[i].message,
        unread: data[i].unread,
        date: data[i].timestamp,
        id: data[i].id,
        message_index: i
      };
      init_messages.push(newMessage);
    }
    this.setState({
      messages: [...init_messages],
      dataStatus: "SUCCESS"
    });
  }

  dataFailed() {
    this.setState({
      dataStatus: "FAILED"
    });
  }

  initializeState(data) {
    let tempMessages = [];
    for (let i = 0; i < data.length; i++) {
      const newMessage = {};
      tempMessages.push(newMessage);
    }
  }

  refreshData() {
    const userID = localStorage.getItem("userID");
    axios
      .get("https://felis-234504.appspot.com/users/" + userID + "/messages", {
        headers: { Authorization: localStorage.getItem("access_token") }
      })
      .then(response => {
        this.initData(response.data);
      })
      .catch(error => {
        console.log("that route probably doesn't exist yet");
        console.log(error);
      });
  }

  resetForm() {
    this.setState({
      showAddMessage: false,
      showEditMessage: false,
      showDeleteMessage: false
    });
  }

  sendNewMessage(message) {
    console.log(message);
    const payload = {
      subject: message.Subject,
      message: message.Message
    };
    const postNewMessage = async payload => {
      axios
        .post("https://felis-234504.appspot.com/messages", payload, {
          headers: { Authorization: localStorage.getItem("access_token") }
        })
        .then(response => {
          this.getSuccessMessage(response);
          this.refreshData();
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return postNewMessage(payload).then(function(response) {
      return response;
    });
  }

  //sorts all messages by data
  //Uses a point system for year, month, and day
  //to determine total date value
  sortByDate(messages) {
    const months = [
      "jan",
      "feb",
      "mar",
      "may",
      "june",
      "july",
      "aug",
      "sept",
      "oct",
      "nov",
      "dec"
    ];
    return messages.sort(function(a, b) {
      const time1 = a.date.split(" ")[4];
      const time2 = b.date.split(" ")[4];
      const day1 = parseInt(a.date.split(" ")[1], 10);
      const day2 = parseInt(b.date.split(" ")[1], 10);
      const month1 = months.indexOf(a.date.split(" ")[2].toLowerCase()) + 100;
      const month2 = months.indexOf(b.date.split(" ")[2].toLowerCase()) + 100;
      const year1 = parseInt(a.date.split(" ")[3], 10) + 1000;
      const year2 = parseInt(b.date.split(" ")[3], 10) + 1000;
      if (day1 + month1 + year1 > day2 + month2 + year2) return -1;
      else if (day1 + month1 + year1 < day2 + month2 + year2) return 1;
      else if (time1 > time2) return -1;
      else return 1;
    });
  }

  sendDeleteMessage(message) {
    const userID = localStorage.getItem("userID");
    const payload = {
      messageID: message.id,
      Authorization: localStorage.getItem("access_token")
    };
    const deleteMessage = async payload => {
      axios
        .delete(
          "https://felis-234504.appspot.com/users/" +
            userID +
            "/messages/" +
            payload.messageID,
          {
            data: payload
          }
        )
        .then(response => {
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return deleteMessage(payload).then(function(response) {
      return response;
    });
  }

  addMessage(message) {
    message.message_index = this.state.messages.length;
    let messagesCopy = [...this.state.messages, message];
    this.setState({ messages: messagesCopy });
  }

  deleteMessage(message) {
    let messagesCopy = [...this.state.messages];
    messagesCopy.splice(message.message_index, 1);
    for (let i = message.message_index; i < messagesCopy.length; i++)
      messagesCopy[i].community_id = i;
    this.setState({ messages: messagesCopy, curIndex: -1 });
  }

  toggleAddMessage() {
    this.setState(state => ({
      showAddMessage: !state.showAddMessage,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  toggleDeleteMessage(event, message_index) {
    this.setState(state => ({
      showDeleteMessage: !state.showDeleteMessage,
      curIndex: message_index,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  AddModal(props) {
    if (!props.show) return null;
    const thisMessage = {
      Subject: "",
      Message: ""
    };
    return (
      <ModalForm
        Object={thisMessage}
        onCancel={this.toggleAddMessage}
        onUpdateObjects={this.addMessage}
        onSend={this.sendNewMessage}
        formType={"add"}
        formTitle={"Add New Message"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  DeleteModal(props) {
    if (!props.show) return null;
    console.log(props.newIndex);
    const message = this.state.messages[props.newIndex];
    const thisMessage = {
      Subject: message.subject,
      Message: message.message,
      Date: message.date,
      id: message.id
    };
    return (
      <ModalForm
        Object={thisMessage}
        onCancel={() => {
          this.toggleDeleteMessage();
          this.refreshData();
        }}
        onUpdateObjects={this.deleteMessage}
        onSend={this.sendDeleteMessage}
        formType={"delete"}
        formTitle={"Delete Message"}
        requestStatus={this.state.requestStatus}
      />
    );
  }

  CreateRow(props) {
    return (
      <div className="communityRow">
        <table>
          <tbody>
            <tr>
              <td className="headerCol">
                <ul>Subject:</ul>
                <ul>Message:</ul>
                <ul>Date:</ul>
              </td>
              <td className="infoCol">
                <ul>{props.message.subject}</ul>
                <ul>{props.message.message}</ul>
                <ul>{props.message.date}</ul>
              </td>
              <td className="buttonCol">
                <button
                  className="trashButton"
                  onClick={event => {
                    event.stopPropagation();
                    this.toggleDeleteMessage(
                      event,
                      props.message.message_index
                    );
                  }}
                >
                  <FontAwesomeIcon icon="trash-alt" size="1x" color="#fff" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  ShowMessages(props) {
    let sortedMessages = this.sortByDate(props.messages);
    sortedMessages.forEach((message, index) => (message.message_index = index));
    const curMessages = sortedMessages.map(newMessage => (
      <this.CreateRow message={newMessage} key={newMessage.id} />
    ));
    return <div>{curMessages}</div>;
  }

  SendMessageBtn(props) {
    if (props.is_admin) {
      return (
        <div className="headerCommunity" onClick={this.toggleAddMessage}>
          <a className="sectionHeaderText">Send Message</a>{" "}
          <button className="sectionButton">
            <FontAwesomeIcon icon="plus" color="#000" />{" "}
            <FontAwesomeIcon icon="envelope" color="#000" />
          </button>
        </div>
      );
    }
    return null;
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
      <div id="CommunitiesBody" className="communityBody">
        <div className="scrollBody">
          <this.ShowMessages
            messages={this.state.messages}
            key={this.state.messages.id}
          />
          <this.AddModal show={this.state.showAddMessage} />
          <this.DeleteModal
            show={this.state.showDeleteMessage}
            newIndex={this.state.curIndex}
          />
        </div>
      </div>
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
                <FontAwesomeIcon icon="envelope" size="2x" color="#D3D3D3" />
              </div>
              <a className="header-text">Message</a>
            </div>
            <div className="vehicleTop">
              <table>
                <tbody>
                  <tr>
                    <th className="sectionHeader">
                      <this.SendMessageBtn is_admin={this.state.is_admin} />
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
            <this.ConditionalRender dataStatus={this.state.dataStatus} />
          </div>
        </div>
      </div>
    );
  }
}

export default Messages;
