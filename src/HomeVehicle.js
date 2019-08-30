import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import HomeWidget from "HomeWidget";

class HomeVehicle extends React.Component {
  static propTypes = {
    data: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      pageData: {
        "Your Vehicle(s):": this.props.data[0].num_resident,
        "Guest Vehicle(s):": this.props.data[0].num_guest
      }
    };
  }

  render() {
    return (
      <div className="home-table-body">
        <div className="vehicle-table-header">
          <div className="header-icon">
            <FontAwesomeIcon icon="car" size="2x" color="#fff" />
          </div>
          <a className="header-text">Vehicle</a>
        </div>
        <div className="vehicleSection">
          <div className="vehicleBodyHome align-middle">
            <div className="widgetBodyHome">
              <HomeWidget data={this.state.pageData} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HomeVehicle;
