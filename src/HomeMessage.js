import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import HomeWidget from "HomeWidget";

class HomeMessage extends React.Component {
  static propTypes = {
    data: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      pageData: {
        "Date:": this.props.data[0].date,
        "Subject:": this.props.data[0].subject,
        "Message:": this.props.data[0].message
      }
    };
  }

  render() {
    return (
      <div className="home-table-body">
        <div className="message-table-header">
          <div className="header-icon">
            <FontAwesomeIcon icon="envelope" size="2x" color="#fff" />
          </div>
          <a className="header-text">Message</a>
        </div>

        <div className="messageSection">
          <div id="CommunitiesBody" className="messageBodyHome">
            <div className="widgetBodyHome">
              <HomeWidget data={this.state.pageData} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HomeMessage;
