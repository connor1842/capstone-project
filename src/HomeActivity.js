import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import HomeWidget from "HomeWidget";

class HomeActivity extends React.Component {
  static propTypes = {
    data: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      pageData: {
        "Date:": this.props.data[0].last_entry[0].timestamp,
        "Plate:": this.props.data[0].last_entry[0].plate,
        "State:": this.props.data[0].last_entry[0].state,
        "Type:": this.props.data[0].last_entry[0].type,
        "Color:": this.props.data[0].last_entry[0].color
      }
    };
  }

  render() {
    return (
      <div className="home-table-body">
        <div className="activity-table-header">
          <div className="header-icon">
            <FontAwesomeIcon icon="calendar-alt" size="2x" color="#fff" />
          </div>
          <a className="header-text">Activity</a>
        </div>
        <div className="activitySection">
          <div className="activityBodyHome align-middle">
            <div className="widgetBodyHome">
              <HomeWidget data={this.state.pageData} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HomeActivity;
