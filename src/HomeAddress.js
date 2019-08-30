import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import HomeWidget from "HomeWidget";

class HomeAddress extends React.Component {
  static propTypes = {
    data: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      pageData: {
        "User:": this.props.data[0].username,
        "Email:": this.props.data[0].email,
        "Phone:": this.props.data[0].phone,
        "Address:":
          this.props.data[0].user_address +
          ", " +
          this.props.data[0].city_state_zip,
        "Community:": this.props.data[0].community_name
      }
    };
  }

  render() {
    return (
      <div className="home-table-body">
        <div className="account-table-header">
          <div className="header-icon">
            <FontAwesomeIcon icon="tachometer-alt" size="2x" color="#fff" />
          </div>
          <a className="header-text">Dashboard</a>
        </div>

        <div className="accountSection">
          <div className="accountBody">
            <div className="widgetBodyHome">
              <div className="accountRowHome">
                <table>
                  <td className="imageRowUser">
                    <img
                      src={require("./img/avatar.png")}
                      alt="car"
                      className="avatarSizeHome"
                    />
                  </td>
                  <td className="dashboardRowUser">
                    <HomeWidget data={this.state.pageData} />
                  </td>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HomeAddress;
