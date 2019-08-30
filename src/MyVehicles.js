import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import ModalForm from "./ModalForm";
import AxiosGetter from "./AxiosGetter";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
const axios = require("axios");
const state_options = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
];

class MyVehicles extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      dataStatus: "NO_MSG",
      showAddTenantModal: false, //controls add tenant vehicle modal window
      showAddGuestModal: false, //controls add guest vehicle modal window
      showEditModal: false, //controls edit vehicle modal window
      showDeleteModal: false, //controls delete vehicle modal window
      vehicleList: [], //class-local list of vehicles for easier access
      currentID: -1,
      requestStatus: "NO_MSG",
      responseMessage: "",
      address_filter: ""
    };
    this.initData = this.initData.bind(this);
    this.dataFailed = this.dataFailed.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.sendNewVehicle = this.sendNewVehicle.bind(this);
    this.sendEditVehicle = this.sendEditVehicle.bind(this);
    this.sendDeleteVehicle = this.sendDeleteVehicle.bind(this);
    this.updateVehicles = this.updateVehicles.bind(this);
    this.addVehicles = this.addVehicles.bind(this);
    this.deleteVehicles = this.deleteVehicles.bind(this);
    this.toggleAddTenantVehicle = this.toggleAddTenantVehicle.bind(this);
    this.toggleAddGuestVehicle = this.toggleAddGuestVehicle.bind(this);
    this.toggleEditVehicle = this.toggleEditVehicle.bind(this);
    this.toggleDeleteVehicle = this.toggleDeleteVehicle.bind(this);
    this.AddModal = this.AddModal.bind(this);
    this.EditModal = this.EditModal.bind(this);
    this.DeleteModal = this.DeleteModal.bind(this);
    this.CreateRow = this.CreateRow.bind(this);
    this.MyVehicleRows = this.MyVehicleRows.bind(this);
    this.GuestVehicleRows = this.GuestVehicleRows.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.matchesAddress = this.matchesAddress.bind(this);
    this.FilterBar = this.FilterBar.bind(this);
    this.ConditionalRender = this.ConditionalRender.bind(this);

    //imported functions
    this.getSuccessMessage = getSuccessMessage.bind(this);
    this.getErrorMessage = getErrorMessage.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") !== "true")
      this.props.history.push("/Login");
    const route = "users/" + localStorage.getItem("userID") + "/vehicles";
    AxiosGetter(route, this.initData, this.dataFailed);
  }

  initData(data) {
    let init_vehicleList = [];
    for (let i = 0; i < data.length; i++) {
      const newVehicle = {
        address: data[i].address,
        color: data[i].color,
        Plate: data[i].plate_number,
        State: data[i].state,
        type: data[i].type,
        guest: data[i].guest ? "yes" : "no",
        Blocked: data[i].blocked ? "yes" : "no",
        expiration: data[i].expiration_date,
        id: data[i].id,
        vehicle_id: i
      };
      init_vehicleList.push(newVehicle);
    }
    this.setState({
      dataStatus: "SUCCESS",
      vehicleList: [...init_vehicleList]
    });
  }

  dataFailed() {
    this.setState({
      dataStatus: "FAILED"
    });
  }

  refreshData() {
    const userID = localStorage.getItem("userID");
    axios
      .get("https://felis-234504.appspot.com/users/" + userID + "/vehicles", {
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

  handleAddressChange(event) {
    this.setState({ address_filter: event.target.value });
  }

  matchesAddress(address) {
    if (this.state.address_filter.length === 0) return true;
    if (!address) return false;
    const lower = address.toLowerCase();
    if (lower.indexOf(this.state.address_filter.toLowerCase()) !== -1)
      return true;
    return false;
  }

  // sendNewVehicle(), sendEditVehicle(), and sendDeleteVehicle() send Axios
  // POST, PUT, and DELETE requests, respectively.
  // These are provided as callbacks to ModalForm.
  sendNewVehicle(vehicle) {
    const userID = localStorage.getItem("userID");
    const payload = {
      plate_number: vehicle.Plate,
      state: vehicle.State.fieldValues.Value,
      type: vehicle.Type,
      color: vehicle.Color,
      guest: vehicle.guest === "guest" ? true : false,
      blocked: false
    };

    const postNewVehicle = async data => {
      axios
        .post(
          "https://felis-234504.appspot.com/users/" + userID + "/vehicles",
          data,
          { headers: { Authorization: localStorage.getItem("access_token") } }
        )
        .then(response => {
          this.refreshData();
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };

    return postNewVehicle(payload).then(function(response) {
      return response;
    });
  }

  sendEditVehicle(vehicle) {
    const usrID = localStorage.getItem("userID");
    const payload = {
      plate_number: vehicle.Plate,
      state: vehicle.State.fieldValues.Value,
      guest: vehicle.Guest.fieldValues.Value === "Yes" ? true : false,
      blocked: vehicle.Blocked.fieldValues.Value === "Yes" ? true : false,
      userID: usrID
    };
    const putVehicle = async data => {
      axios
        .put(
          "https://felis-234504.appspot.com/users/" +
            usrID +
            "/vehicles/" +
            vehicle.id,
          data,
          { headers: { Authorization: localStorage.getItem("access_token") } }
        )
        .then(response => {
          this.refreshData();
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };

    return putVehicle(payload).then(function(response) {
      return response;
    });
  }

  sendDeleteVehicle(vehicle) {
    const userID = localStorage.getItem("userID");
    const deleteVehicle = async () => {
      axios
        .delete(
          "https://felis-234504.appspot.com/users/" +
            userID +
            "/vehicles/" +
            vehicle.id,
          { headers: { Authorization: localStorage.getItem("access_token") } }
        )
        .then(response => {
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };

    return deleteVehicle().then(function(response) {
      return response;
    });
  }

  // These functions are passed as callbacks to ModalVehicleForm. updateVehicles()
  // responds to Edit to update individual properties in state.vehicles, addVehicles()
  // adds a vehicle to state.vehicles, and deleteVehicles() removes one. This only
  // affects the UI - DOES NOT interact with the server
  addVehicles(newVehicle) {
    newVehicle.vehicle_id = this.state.vehicleList.length;
    let vehiclesCopy = [...this.state.vehicleList, newVehicle]; //append new vehicle to end of array
    this.setState({ vehicleList: vehiclesCopy });
  }

  updateVehicles(newVehicle) {
    let vehiclesCopy = [...this.state.vehicleList];
    vehiclesCopy[newVehicle.vehicle_id] = { ...newVehicle };
    this.setState({ vehicleList: vehiclesCopy, currentID: -1 });
  }

  deleteVehicles(vehicle) {
    let vehiclesCopy = [...this.state.vehicleList];
    vehiclesCopy.splice(vehicle.vehicle_id, 1);
    for (
      let i = vehicle.vehicle_id;
      i < vehiclesCopy.length;
      i++ //reassigns indices from the index of the deleted
    )
      vehiclesCopy[i].vehicle_id = i; //object to the end of the array
    this.setState({ vehicleList: vehiclesCopy, currentID: -1 });
  }

  // toggleAddVehicle(), toggleEditVehicle(), and toggleDeleteVehicle() all trigger a
  // modal screen to be displayed or hidden
  toggleAddTenantVehicle() {
    this.setState(state => ({
      showAddTenantModal: !state.showAddTenantModal,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  toggleAddGuestVehicle() {
    this.setState(state => ({
      showAddGuestModal: !state.showAddGuestModal,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  toggleEditVehicle(event, vehicleID) {
    this.setState(state => ({
      showEditModal: !state.showEditModal,
      currentID: vehicleID,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
    console.log(this.state.vehicleList);
  }

  toggleDeleteVehicle(event, vehicleID) {
    this.setState(state => ({
      showDeleteModal: !state.showDeleteModal,
      currentID: vehicleID,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  // AddModal() displays the Add Vehicle Modal window when the user clicks the add button.
  // It populates with a form for entering new vehicle data
  AddModal(props) {
    if (!props.show) return null;
    const thisVehicle = {
      Type: "",
      Color: "",
      Plate: "",
      State: {
        fieldType: "enum",
        fieldValues: { Value: "AL", Options: state_options }
      },
      guest: props.type,
      id: props.id
    };
    return (
      <ModalForm
        Object={thisVehicle}
        onCancel={
          props.type === "tenant"
            ? this.toggleAddTenantVehicle
            : this.toggleAddGuestVehicle
        }
        onUpdateObjects={this.addVehicles}
        onSend={this.sendNewVehicle}
        formType={"add"}
        formTitle={"Add New " + props.type + " Vehicle"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  // EditModal() takes as arguments the show state, which determines whether or not to
  // render the window, as well as the newID, which is the ID of the vehicle to edit
  EditModal(props) {
    if (!props.show) return null;
    let thisVehicle = { ...this.state.vehicleList[props.newID] };
    thisVehicle["State"] = {
      fieldType: "enum",
      fieldValues: {
        Value: this.state.vehicleList[props.newID]["State"].toUpperCase(),
        Options: state_options
      }
    };
    thisVehicle["Guest"] = {
      fieldType: "bool",
      fieldValues: {
        Value:
          this.state.vehicleList[props.newID]["guest"] === "yes" ? "Yes" : "No",
        Options: ["Yes", "No"]
      }
    };
    thisVehicle["Blocked"] = {
      fieldType: "bool",
      fieldValues: {
        Value:
          this.state.vehicleList[props.newID]["Blocked"] === "yes"
            ? "Yes"
            : "No",
        Options: ["Yes", "No"]
      }
    };
    return (
      <ModalForm
        Object={thisVehicle}
        onCancel={event => this.toggleEditVehicle(event, props.newID)}
        onUpdateObjects={this.updateVehicles}
        onSend={this.sendEditVehicle}
        formType={"edit"}
        formTitle={"Edit Vehicle"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  // DeleteModal() takes as arguments the show state, which determines whether or not
  // to render the window, as well as the newID, which is the ID of the vehicle to delete
  DeleteModal(props) {
    if (!props.show) return null;
    const thisVehicle = this.state.vehicleList[props.newID];
    return (
      <ModalForm
        Object={thisVehicle}
        onCancel={event => {
          this.toggleDeleteVehicle(event, props.newID);
          this.refreshData();
        }}
        onUpdateObjects={this.deleteVehicles}
        onSend={this.sendDeleteVehicle}
        formType={"delete"}
        formTitle={"Are you sure you want to delete this vehicle?"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  // CreateRow() component adds vehicles to Tenant or Guest tables. Called from MyVehicleRows()
  // and GuestVehicleRows()
  CreateRow(props) {
    return (
      <div className="vehicleRow">
        <table>
          <tbody>
            <tr>
              <td className="imageCol2">
                <img
                  src={require("./img/temp/blackcivic.jpeg")}
                  width="100px"
                  alt="car"
                />
              </td>
              <td className="headerCol2">
                <ul>Address:</ul>
                <ul>Type:</ul>
                <ul>Color:</ul>
                <ul>Plate:</ul>
                <ul>State:</ul>
                <ul>Blocked:</ul>
              </td>
              <td className="infoCol2">
                <ul>{props.vehicleRow.address}</ul>
                <ul>{props.vehicleRow.type}</ul>
                <ul>{props.vehicleRow.color}</ul>
                <ul>{props.vehicleRow.Plate}</ul>
                <ul>{props.vehicleRow.State}</ul>
                <ul>{props.vehicleRow.Blocked}</ul>
              </td>
              <td className="buttonCol2">
                <button
                  className="cogButton "
                  onClick={event =>
                    this.toggleEditVehicle(event, props.vehicleRow.vehicle_id)
                  }
                >
                  <FontAwesomeIcon icon="cog" size="1x" color="#fff" />
                </button>
                <button
                  className="trashButton"
                  onClick={event =>
                    this.toggleDeleteVehicle(event, props.vehicleRow.vehicle_id)
                  }
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

  MyVehicleRows(props) {
    const myVehicles = props.updatedVehicles
      .filter(
        vehicle =>
          vehicle.guest === "no" && this.matchesAddress(vehicle.address)
      )
      .map(vehicle => <this.CreateRow vehicleRow={vehicle} key={vehicle.id} />);
    return <div>{myVehicles}</div>;
  }

  GuestVehicleRows(props) {
    const guestVehicles = props.updatedVehicles
      .filter(
        vehicle =>
          vehicle.guest === "yes" && this.matchesAddress(vehicle.address)
      )
      .map(vehicle => <this.CreateRow vehicleRow={vehicle} key={vehicle.id} />);
    return <div id="GuestTable">{guestVehicles}</div>;
  }

  FilterBar(props) {
    return (
      <div className="filterBar2">
        <label htmlFor="addressFilter">Search By Address: </label>
        <input
          name="address_filter"
          type="text"
          value={props.curAddress}
          onChange={event => {
            this.handleAddressChange(event);
          }}
        />
      </div>
    );
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
              <div className="scrollBody2">
                <this.AddModal
                  show={this.state.showAddTenantModal}
                  type="tenant"
                />
                <this.EditModal
                  show={this.state.showEditModal}
                  newID={this.state.currentID}
                />
                <this.DeleteModal
                  show={this.state.showDeleteModal}
                  newID={this.state.currentID}
                />
                <this.MyVehicleRows updatedVehicles={this.state.vehicleList} />
              </div>
            </td>
            <div className="spacer" />
            <td>
              <div className="scrollBody2">
                <this.AddModal
                  show={this.state.showAddGuestModal}
                  type="guest"
                />
                <this.EditModal
                  show={this.state.showEditModal}
                  newID={this.state.currentID}
                />
                <this.DeleteModal
                  show={this.state.showDeleteModal}
                  newID={this.state.currentID}
                />
                <this.GuestVehicleRows
                  updatedVehicles={this.state.vehicleList}
                />
              </div>
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
                <FontAwesomeIcon icon="car" size="2x" color="#00C853" />
              </div>
              <a className="header-text">Vehicles</a>
            </div>
            <div className="vehicleTop">
              <table>
                <tbody>
                  <tr>
                    <th className="sectionHeader2">
                      <div className="headerTenant">
                        <a className="sectionHeaderText">My Vehicles</a>{" "}
                        <button
                          className="sectionButton"
                          onClick={this.toggleAddTenantVehicle}
                        >
                          <FontAwesomeIcon icon="plus" color="#000" />{" "}
                          <FontAwesomeIcon icon="car-side" color="#000" />
                        </button>
                      </div>
                    </th>
                    <th className="sectionHeader2">
                      <div className="headerGuest">
                        <a className="sectionHeaderText">Guest Vehicles</a>{" "}
                        <button
                          className="sectionButton"
                          onClick={this.toggleAddGuestVehicle}
                        >
                          <FontAwesomeIcon icon="plus" color="#000" />{" "}
                          <FontAwesomeIcon icon="car-side" color="#000" />
                        </button>
                      </div>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="VehiclesBody" className="vehicleBody">
              <table>
                <this.FilterBar curAddress={this.state.address_filter} />
              </table>
              <this.ConditionalRender dataStatus={this.state.dataStatus} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyVehicles;
