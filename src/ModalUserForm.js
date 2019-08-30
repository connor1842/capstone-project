import React from "react";
import PropTypes from "prop-types";
class ModalUserForm extends React.Component {
  static propTypes = {
    user: PropTypes.any,
    formType: PropTypes.any,
    formTitle: PropTypes.any,
    onChangeState: PropTypes.func,
    onCancel: PropTypes.func,
    onSend: PropTypes.func,
    onUpdateUsers: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      user: { ...this.props.user },
      formType: this.props.formType,
      formTitle: this.props.formTitle,
      showMsg: false
    };

    this.cancelForm = this.cancelForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.showErrorMsg = this.showErrorMsg.bind(this);
    this.DynamicSelect = this.DynamicSelect.bind(this);
    this.DynamicRadios = this.DynamicRadios.bind(this);
    this.FormField = this.FormField.bind(this);
    this.AddEditForm = this.AddEditForm.bind(this);
    this.DeleteForm = this.DeleteForm.bind(this);
    this.FormRender = this.FormRender.bind(this);
  }

  // cancelForm() calls the callback provided by the part component.
  // This callback should cause the current modal screen to be hidden
  cancelForm(event) {
    event.preventDefault();
    this.props.onCancel();
  }

  // handleSubmit() sends the modified data to sendNewUser(), sendEditUser(),
  // or deleteUser(), depending on this.state.formType. Once the server responds,
  // this then calls onUpdateUsers() to update the UI, followed by onCancel() to
  // hide the form.
  handleSubmit(event) {
    event.preventDefault();
    if (this.props.onSend(this.state.user) === "SUCCESS") {
      this.props.onUpdateUsers(this.state.user);
      this.props.onCancel();
    } else this.showErrorMsg();
  }

  // handleChange() updates the state properties as the user edits the form fields
  handleChange(event, property) {
    console.log("property:" + property);
    const newVal = event.target.value;
    let userCopy = { ...this.state.user };
    userCopy[property] = newVal;
    this.setState({
      user: userCopy
    });
  }

  // handleSelectChange() functions just like handleChange(), but changes the values
  // for DynamicSelect()
  handleOptionsChange(event, property) {
    let itemCopy = { ...this.state.user };
    itemCopy[property].fieldValues.Value = event.target.value;
    this.setState({ user: { ...itemCopy } });
  }

  // Toggles state.showMsg. This should only be called when an HTTP request fails
  showErrorMsg() {
    this.setState({
      showMsg: true
    });
  }

  // Displays the error message
  ErrorMsg(props) {
    if (!props.showMsg) return null;
    return <h3>Failed to send</h3>;
  }

  DynamicSelect(props) {
    const options = props.fieldValues.Options.map(thisOption => (
      <option value={thisOption} key={thisOption.id}>
        {thisOption}
      </option>
    ));
    return (
      <select
        value={this.state.user[props.propType].fieldValues.Value}
        onChange={event => this.handleOptionsChange(event, props.propType)}
      >
        {options}
      </select>
    );
  }

  DynamicRadios(props) {
    const options = props.fieldValues.Options.map(thisOption => (
      <div key={thisOption.id}>
        <label>{thisOption}</label>
        <input
          type="radio"
          checked={
            this.state.user[props.propType].fieldValues.Value === thisOption
          }
          value={thisOption}
          onChange={event => this.handleOptionsChange(event, props.propType)}
        />
      </div>
    ));
    return options;
  }

  FormField(props) {
    let field;
    switch (props.fieldType) {
      case "enum": //creates a select dropdown
        field = (
          <this.DynamicSelect
            fieldValues={props.fieldValues}
            propType={props.propType}
          />
        );
        break;
      case "bool": //creates radio buttons
        field = (
          <this.DynamicRadios
            fieldValues={props.fieldValues}
            propType={props.propType}
          />
        );
        break;
      case "input":
      default:
        field = (
          <input
            value={props.fieldVal}
            onChange={event => this.handleChange(event, props.propType)}
          />
        );
        break;
    }
    return field;
  }

  // AddEditForm() and DeleteForm() components both function the same way:
  // they render a form field for each property in the object passed to the
  // ModalForm component.
  // NOTE: only capitalized property names will be rendered
  AddEditForm(props) {
    let formFields = [];
    for (var prop in props.curUser) {
      const thisProp = prop;
      if (thisProp[0] === thisProp[0].toUpperCase()) {
        formFields.push(
          <form>
            <label className="modalBodyLabel">{prop}</label>
            <label className="modalBodyInput">
              <this.FormField
                fieldType={props.curUser[thisProp].fieldType}
                fieldVal={props.curUser[thisProp]}
                propType={thisProp}
                fieldValues={props.curUser[thisProp].fieldValues}
              />
            </label>
          </form>
        );
      }
    }
    return (
      <div className="modalForm">
        <h2 className="modalHeader">
          {props.formTitle}
          <button
            onClick={event => {
              this.cancelForm(event);
            }}
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </h2>
        <form>
          <div className="modalBody">{formFields}</div>
          <div className="modalFooter">
            <button
              className="modalButton modalButtonLeft"
              onClick={event => {
                this.handleSubmit(event);
              }}
            >
              Submit
            </button>
            <button
              className="modalButton modalButtonRight"
              onClick={event => {
                this.cancelForm(event);
              }}
            >
              Cancel
            </button>
            <this.ErrorMsg showMsg={this.state.showMsg} />
          </div>
        </form>
      </div>
    );
  }

  DeleteForm(props) {
    let formFields = [];
    for (var prop in props.curUser) {
      const thisProp = prop;
      if (thisProp[0] === thisProp[0].toUpperCase()) {
        formFields.push(
          <span>
            {thisProp}: {props.curUser[thisProp]}
          </span>
        );
        formFields.push(<br />);
      }
    }
    return (
      <div className="modalForm">
        <h2 className="modalHeader">
          {props.formTitle}
          <button
            onClick={event => {
              this.cancelForm(event);
            }}
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </h2>
        <div className="modalBody">{formFields}</div>
        <div className="modalFooter">
          <button
            className="modalButton modalButtonLeft"
            onClick={event => this.handleSubmit(event)}
          >
            Confirm
          </button>
          <button
            className="modalButton modalButtonRight"
            onClick={event => this.cancelForm(event)}
          >
            Cancel
          </button>
          <this.ErrorMsg showMsg={this.state.showMsg} />
        </div>
      </div>
    );
  }

  // FormRender calls AddEditForm() or DeleteForm(), depending on the formType
  FormRender(props) {
    if (
      props.curState.formType === "add" ||
      props.curState.formType === "edit"
    ) {
      return (
        <this.AddEditForm
          formTitle={props.curState.formTitle}
          curUser={props.curState.user}
        />
      );
    } else if (props.curState.formType === "delete") {
      return (
        <this.DeleteForm
          formTitle={props.curState.formTitle}
          curUser={props.curState.user}
        />
      );
    } else return null;
  }

  render() {
    return <this.FormRender curState={this.state} />;
  }
}

export default ModalUserForm;
