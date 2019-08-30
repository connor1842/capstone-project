import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import ModalForm from "./ModalForm";
import AxiosGetter from "./AxiosGetter";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getSuccessMessage, getErrorMessage } from "./CommHelpers";
const axios = require("axios");

class Community extends React.Component {
  static propTypes = {
    data: PropTypes.any,
    history: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      tenants: [],
      dataStatus: "NO_MSG",
      showAddTenant: false,
      showEditTenant: false,
      showDeleteTenant: false,
      curIndex: -1,
      requestStatus: "NO_MSG",
      responseMessage: "",
      address_filter: ""
    };

    this.initData = this.initData.bind(this);
    this.dataFailed = this.dataFailed.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.sendNewTenant = this.sendNewTenant.bind(this);
    this.sendEditTenant = this.sendEditTenant.bind(this);
    this.sendDeleteTenant = this.sendDeleteTenant.bind(this);
    this.updateTenant = this.updateTenant.bind(this);
    this.addTenant = this.addTenant.bind(this);
    this.deleteTenant = this.deleteTenant.bind(this);
    this.toggleAddTenant = this.toggleAddTenant.bind(this);
    this.toggleEditTenant = this.toggleEditTenant.bind(this);
    this.toggleDeleteTenant = this.toggleDeleteTenant.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.matchesAddress = this.matchesAddress.bind(this);
    this.AddModal = this.AddModal.bind(this);
    this.EditModal = this.EditModal.bind(this);
    this.DeleteModal = this.DeleteModal.bind(this);
    this.CreateRow = this.CreateRow.bind(this);
    this.FilterBar = this.FilterBar.bind(this);
    this.ShowTenants = this.ShowTenants.bind(this);
    this.ConditionalRender = this.ConditionalRender.bind(this);

    //imported functions
    this.getSuccessMessage = getSuccessMessage.bind(this);
    this.getErrorMessage = getErrorMessage.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") !== "true")
      this.props.history.push("/Login");
    const route = "/users";
    AxiosGetter(route, this.initData, this.dataFailed);
  }

  initData(data) {
    let initTenants = [];
    for (let i = 0; i < data.length; i++) {
      const newAccount = {
        username: data[i].username,
        address: data[i].address,
        email: data[i].email,
        phone: data[i].phone,
        admin: data[i].admin ? "Yes" : "No",
        last_login: data[i].last_login,
        id: data[i].id,
        tenant_index: i
      };
      initTenants.push(newAccount);
    }
    console.log(initTenants);
    this.setState({
      tenants: [...initTenants],
      dataStatus: "SUCCESS"
    });
  }

  dataFailed() {
    this.setState({
      dataStatus: "FAILED"
    });
  }

  refreshData() {
    axios
      .get("https://felis-234504.appspot.com/users", {
        headers: { Authorization: localStorage.getItem("access_token") }
      })
      .then(response => {
        this.initData(response.data);
        console.log("REFRESHED DATA");
      })
      .catch(error => {
        console.log("that route probably doesn't exist yet");
        console.log(error);
      });
  }

  resetForm() {
    this.setState({
      showAddTenant: false,
      showEditTenant: false,
      showDeleteTenant: false
    });
  }

  sendNewTenant(tenant) {
    console.log(tenant);
    const payload = {
      email: tenant.Email,
      address: tenant.Address,
      admin: tenant.Admin.fieldValues.Value === "Yes" ? true : false
    };
    const postNewTenant = async data => {
      axios
        .post("https://felis-234504.appspot.com/invitation", data, {
          headers: { Authorization: localStorage.getItem("access_token") }
        })
        .then(response => {
          this.refreshData();
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return postNewTenant(payload).then(function(response) {
      return response;
    });
  }

  sendEditTenant(tenant) {
    console.log(tenant);
    const payload = {
      email: tenant.Email,
      address: tenant.Address,
      admin: tenant.Admin.fieldValues.Value === "Yes" ? true : false,
      id: tenant.id
    };
    const putTenant = async data => {
      axios
        .put("https://felis-234504.appspot.com/users/" + data.id, data, {
          headers: { Authorization: localStorage.getItem("access_token") }
        })
        .then(response => {
          this.refreshData();
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return putTenant(payload).then(function(response) {
      console.log(response);
    });
  }

  sendDeleteTenant(tenant) {
    const payload = {
      id: tenant.id,
      Authorization: localStorage.getItem("access_token")
    };
    const deleteTenant = async payload => {
      axios
        .delete("https://felis-234504.appspot.com/users/" + payload.id, {
          data: payload
        })
        .then(response => {
          this.getSuccessMessage(response);
        })
        .catch(err => {
          this.getErrorMessage(err);
        });
    };
    return deleteTenant(payload).then(function(response) {
      return response;
    });
  }

  addTenant(tenant) {
    tenant.tenant_index = this.state.tenants.length;
    let tenantsCopy = [...this.state.tenants, tenant];
    this.setState({ tenants: tenantsCopy });
  }

  updateTenant(tenant) {
    let tenantsCopy = [...this.state.tenants];
    tenantsCopy[tenant.tenant_index] = { ...tenant };
    this.setState({ tenants: tenantsCopy, curIndex: -1 });
  }

  deleteTenant(tenant) {
    let tenantsCopy = [...this.state.tenants];
    tenantsCopy.splice(tenant.tenant_index, 1);
    for (let i = tenant.tenant_index; i < tenantsCopy.length; i++)
      tenantsCopy[i].community_id = i;
    this.setState({ tenants: tenantsCopy, curIndex: -1 });
  }

  toggleAddTenant() {
    this.setState(state => ({
      showAddTenant: !state.showAddTenant,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  toggleEditTenant(event, tenant_index) {
    this.setState(state => ({
      showEditTenant: !state.showEditTenant,
      curIndex: tenant_index,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
  }

  toggleDeleteTenant(event, tenant_index) {
    this.setState(state => ({
      showDeleteTenant: !state.showDeleteTenant,
      curIndex: tenant_index,
      requestStatus: "NO_MSG",
      responseMessage: ""
    }));
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

  AddModal(props) {
    if (!props.show) return null;
    const thisTenant = {
      Address: "",
      Email: "",
      Admin: {
        fieldType: "bool",
        fieldValues: { Value: "No", Options: ["Yes", "No"] }
      }
    };
    return (
      <ModalForm
        Object={thisTenant}
        onCancel={this.toggleAddTenant}
        onUpdateObjects={this.addTenant}
        onSend={this.sendNewTenant}
        formType={"add"}
        formTitle={"Add New Tenant"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  EditModal(props) {
    if (!props.show) return null;
    console.log(props.newIndex);
    const tenant = this.state.tenants[props.newIndex];
    const thisTenant = {
      Admin: {
        fieldType: "bool",
        fieldValues: { Value: tenant.admin, Options: ["Yes", "No"] }
      },
      id: tenant.id
    };
    return (
      <ModalForm
        Object={thisTenant}
        onCancel={this.toggleEditTenant}
        onUpdateObjects={this.editTenant}
        onSend={this.sendEditTenant}
        formType={"edit"}
        formTitle={"Change " + tenant.username + "'s Admin Status"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
      />
    );
  }

  DeleteModal(props) {
    if (!props.show) return null;
    console.log(props.newIndex);
    const tenant = this.state.tenants[props.newIndex];
    const thisTenant = {
      User: tenant.username,
      Address: tenant.address,
      Admin: tenant.admin,
      Email: tenant.email,
      Phone: tenant.phone,
      id: tenant.id
    };
    return (
      <ModalForm
        Object={thisTenant}
        onCancel={() => {
          this.toggleDeleteTenant();
          this.refreshData();
        }}
        onUpdateObjects={this.deleteTenant}
        onSend={this.sendDeleteTenant}
        formType={"delete"}
        formTitle={"Delete Tenant"}
        requestStatus={this.state.requestStatus}
        responseMessage={this.state.responseMessage}
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
                <ul>User:</ul>
                <ul>Address:</ul>
                <ul>Email:</ul>
                <ul>Phone:</ul>
                <ul>Last Login:</ul>
                <ul>Admin:</ul>
              </td>
              <td className="infoCol">
                <ul>{props.tenant.username}</ul>
                <ul>{props.tenant.address}</ul>
                <ul>{props.tenant.email}</ul>
                <ul>{props.tenant.phone}</ul>
                <ul>{props.tenant.last_login}</ul>
                <ul className="admin-user-text">{props.tenant.admin}</ul>
              </td>
              <td className="buttonCol">
                <button
                  className="cogButton"
                  onClick={event => {
                    event.stopPropagation();
                    this.toggleEditTenant(event, props.tenant.tenant_index);
                  }}
                >
                  <FontAwesomeIcon icon="cog" size="1x" color="#fff" />
                </button>
                <button
                  className="trashButton"
                  onClick={event => {
                    event.stopPropagation();
                    this.toggleDeleteTenant(event, props.tenant.tenant_index);
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

  ShowTenants(props) {
    const filteredTenants = props.tenants.filter(tenant =>
      this.matchesAddress(tenant.address)
    );
    const curTenants = filteredTenants.map(newTenant => (
      <this.CreateRow tenant={newTenant} key={newTenant.id} />
    ));
    return <div>{curTenants}</div>;
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
      <div className="scrollBody2">
        <this.ShowTenants
          tenants={this.state.tenants}
          key={this.state.tenants.id}
        />
        <this.AddModal show={this.state.showAddTenant} />
        <this.EditModal
          show={this.state.showEditTenant}
          newIndex={this.state.curIndex}
        />
        <this.DeleteModal
          show={this.state.showDeleteTenant}
          newIndex={this.state.curIndex}
        />
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
                <FontAwesomeIcon icon="building" size="2x" color="#F44336" />
              </div>
              <a className="header-text">Community</a>
            </div>
            <div className="vehicleTop">
              <table>
                <tbody>
                  <tr>
                    <th className="sectionHeader">
                      <div
                        className="headerCommunity"
                        onClick={this.toggleAddTenant}
                      >
                        <a className="sectionHeaderText">Invite New Tenant</a>{" "}
                        <button className="sectionButton">
                          <FontAwesomeIcon icon="plus" color="#000" />{" "}
                          <FontAwesomeIcon icon="user-circle" color="#000" />
                        </button>
                      </div>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="CommunitiesBody" className="communityBody">
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

export default Community;
