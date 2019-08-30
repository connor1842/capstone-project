import React from "react";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";

// ModalForm is a generic component. It is blind to the types of object passed to it, which means that any
// object can use this component, with a few restrictions.
// To call this component, the following parameters are used:
// Object           - The object who's fields will be displayed in the form.
// onCancel         - A callback to a parent method that hides the modal form.
// onUpdateObjects  - A callback to a parent method that updates the Object in the state of the parent
//                    component.
// onSend           - A callback to a parent method that sends the HTTP request on submission of the form.
// formType         - "add", "edit", or "delete". Determines how to render the form
// formTitle        - The desired title to be displayed on the top of the form.
// NOTE: this component will only render and interact with object properties that are capitalized. This
//       allows the component to distinguish what data is important in the object.
//       your objects may have  other properties, (e.g., index, if it's in a list), but these will be
//       ignored.

class ModalForm extends React.Component {
  static propTypes = {
    onChangeState: PropTypes.func,
    onCancel: PropTypes.func,
    onSend: PropTypes.func,
    onUpdateObjects: PropTypes.func,
    Object: PropTypes.any,
    formType: PropTypes.any,
    formTitle: PropTypes.any,
    route: PropTypes.any,
    requestStatus: PropTypes.any,
    responseMessage: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      Object: { ...this.props.Object },
      formType: this.props.formType,
      formTitle: this.props.formTitle,
      axiosRoute: this.props.route,
      show_password_error: false,
      has_password: false,
      requestStatus: "NO_MSG",
      responseMessage: "",
      passwordPair: []
    };

    this.cancelForm = this.cancelForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.passwordCheck = this.passwordCheck.bind(this);
    this.resolvePasswordPair = this.resolvePasswordPair.bind(this);
    this.StatusMsg = this.StatusMsg.bind(this);
    this.DynamicSelect = this.DynamicSelect.bind(this);
    this.DynamicRadios = this.DynamicRadios.bind(this);
    this.FormField = this.FormField.bind(this);
    this.ShowPasswordErr = this.ShowPasswordErr.bind(this);
    this.ButtonGroup = this.ButtonGroup.bind(this);
    this.AddEditForm = this.AddEditForm.bind(this);
    this.DeleteForm = this.DeleteForm.bind(this);
    this.FormRender = this.FormRender.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.resolvePasswordPair();
  }

  // Decides what status message should display on the form: "Success", "Failure", or none
  componentDidUpdate(prevProps) {
    if (this.props.requestStatus !== prevProps.requestStatus) {
      this.setState({
        requestStatus: this.props.requestStatus,
        responseMessage: this.props.responseMessage
      });
    }
  }

  // cancelForm() calls the callback provided by the part component. This callback should
  // cause the current modal screen to be hidden
  cancelForm(event) {
    event.preventDefault();
    this.props.onCancel();
  }

  // handleSubmit() sends the modified data to sendNewVehicle() sendEditVehicle(), or
  // deleteVehicle(), depending on this.state.formType. Once the server responds, this
  // then calls onUpdateVehicles() to update the UI, followed by onCancel() to hide the form.
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.show_password_error) return;
    this.props.onSend(this.state.Object);
  }

  // handleChange() updates the state properties as the user edits the form fields
  handleChange(event, property) {
    console.log("property:" + property);
    const newVal = event.target.value;
    let objectCopy = { ...this.state.Object };
    objectCopy[property] = newVal;
    this.setState({
      Object: objectCopy
    });
    console.log(property + " = " + this.state.passwordPair[0]);
    console.log(property + " = " + this.state.passwordPair[1]);
    if (
      property === this.state.passwordPair[0] ||
      property === this.state.passwordPair[1]
    )
      this.passwordCheck(property, event.target.value);
  }

  // PasswordCheck() - performs a check between password and confirm
  // password if a password field is present in the form
  passwordCheck(property, value) {
    const parallel_prop =
      property === this.state.passwordPair[0]
        ? this.state.passwordPair[1]
        : this.state.passwordPair[0];
    console.log(parallel_prop);
    if (value !== this.state.Object[parallel_prop])
      this.setState({ show_password_error: true });
    else this.setState({ show_password_error: false });
  }

  // handleSelectChange() functions just like handleChange(), but changes the
  // values for DynamicSelect()
  handleOptionsChange(event, property) {
    let itemCopy = { ...this.state.Object };
    itemCopy[property].fieldValues.Value = event.target.value;
    this.setState({ Object: { ...itemCopy } });
  }

  /******************************************************
    Gets the last two password fields in the form
	for use in the password confirmation process
  ******************************************************/
  resolvePasswordPair() {
    let temp = [];
    for (let prop in this.state.Object) {
      console.log(prop);
      if (prop.toLowerCase().indexOf("password") !== -1) temp.push(prop);
    }
    if (temp.length > 2) {
      while (temp.length > 2) temp.shift();
    }
    this.setState({ passwordPair: [...temp] });
    console.log(temp);
  }

  // Displays the error message
  StatusMsg(props) {
    switch (props.status) {
      case "SUCCESS":
        return (
          <a className="form-message-success">
            <br />
            Request Successful
            <br />
            {props.responseMessage}
          </a>
        );
      case "FAILURE":
        return (
          <a className="form-message-failed">
            <br />
            Request Failed
            <br />
            {props.responseMessage}
          </a>
        );
      default:
        return null;
    }
  }

  DynamicSelect(props) {
    //const curVal = props.fieldValues.Value;
    const options = props.fieldValues.Options.map(thisOption => (
      <option value={thisOption} key={thisOption.id}>
        {thisOption}
      </option>
    ));
    return (
      <select
        className="custom-select"
        value={this.state.Object[props.propType].fieldValues.Value}
        onChange={event => this.handleOptionsChange(event, props.propType)}
      >
        {options}
      </select>
    );
  }

  DynamicRadios(props) {
    //const curVal = props.fieldValues.Value;
    const options = props.fieldValues.Options.map(thisOption => (
      <label className="radioCustom" key={thisOption.id}>
        <div className="form-check form-check-inline">
          <Radio
            id="inlineRadio1"
            checked={
              this.state.Object[props.propType].fieldValues.Value === thisOption
            }
            onChange={event => this.handleOptionsChange(event, props.propType)}
            value={thisOption}
            control={<Radio color="primary" />}
          />
          <label className="form-check-label" htmlFor="inlineRadio1">
            {thisOption}
          </label>
        </div>
      </label>
    ));
    return options;
  }

  FormField(props) {
    let field;
    //const val = props.fieldVal;
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
            type={
              props.propType.indexOf("Password") !== -1
                ? "password"
                : props.propType.string
            }
            onChange={event => {
              this.handleChange(event, props.propType);
            }}
          />
        );
        break;
    }
    return field;
  }

  // showPasswordErr() - shows error message if Password and confirm
  // password don't match
  ShowPasswordErr(props) {
    if (props.showMsg)
      return <p className="passError">Passwords don&#39;t match</p>;
    else return null;
  }

  ButtonGroup(props) {
    if (props.requestStatus === "NO_MSG")
      return (
        <div className="modalFooter">
          <button
            className="modalButton modalButtonLeft"
            onClick={event => {
              this.handleSubmit(event);
            }}
          >
            {props.confirmText}
          </button>
          <button
            className="modalButton modalButtonRight"
            onClick={event => {
              this.cancelForm(event);
            }}
          >
            Cancel
          </button>
          <this.StatusMsg
            status={this.state.requestStatus}
            responseMessage={this.state.responseMessage}
          />
        </div>
      );
    else {
      console.log("creating default button group");
      return (
        <div className="modalFooter">
          <button
            className="modalButton modalButtonRight"
            onClick={event => {
              this.cancelForm(event);
            }}
          >
            OK
          </button>
          <this.StatusMsg
            status={this.state.requestStatus}
            responseMessage={this.state.responseMessage}
          />
        </div>
      );
    }
  }

  // AddEditForm() and DeleteForm() components both function the same way:
  // they render a form field for each property in the object passed to
  // the ModalForm component.
  // NOTE: only capitalized property names will be rendered
  AddEditForm(props) {
    let formFields = [];
    for (var prop in props.curObject) {
      const thisProp = prop;
      if (thisProp[0] === thisProp[0].toUpperCase()) {
        formFields.push(
          <form>
            <label className="modalBodyLabel">{prop}</label>
            <label className="modalBodyInput">
              <this.FormField
                fieldType={props.curObject[thisProp].fieldType}
                fieldVal={props.curObject[thisProp]}
                propType={thisProp}
                fieldValues={props.curObject[thisProp].fieldValues}
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
        <div>
          <div className="modalBody">{formFields}</div>
          <this.ButtonGroup
            confirmText={"Submit"}
            requestStatus={this.state.requestStatus}
          />
        </div>
        <a className="form-message-failed">
          <this.ShowPasswordErr showMsg={this.state.show_password_error} />
        </a>
      </div>
    );
  }

  DeleteForm(props) {
    let formFields = [];
    for (var prop in props.curObject) {
      const thisProp = prop;
      if (thisProp[0] === thisProp[0].toUpperCase()) {
        formFields.push(
          <span>
            {thisProp}: {props.curObject[thisProp]}
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
        <this.ButtonGroup
          confirmText={"Confirm"}
          requestStatus={this.state.requestStatus}
        />
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
          curObject={props.curState.Object}
        />
      );
    } else if (props.curState.formType === "delete") {
      return (
        <this.DeleteForm
          formTitle={props.curState.formTitle}
          curObject={props.curState.Object}
        />
      );
    } else return null;
  }

  render() {
    return <this.FormRender curState={this.state} />;
  }
}

export default ModalForm;
