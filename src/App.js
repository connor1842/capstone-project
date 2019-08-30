import React from "react";
import PropTypes from "prop-types";

class App extends React.Component {
  static propTypes = {
    history: PropTypes.any
  };

  UNSAFE_componentWillMount() {
    if (localStorage.getItem("is_loggedIn") === "true")
      this.props.history.push("/Home");
    else this.props.history.push("/Login");
  }

  render() {
    return null;
  }
}

export default App;
