import React from "react";
import PropTypes from "prop-types";

// Reusable class for rendering simple
// data for the home widgets
// Usage: <HomeWidget data={desired_data} />
//	      where `desired_data` is an iterable
//				object with simple fields (no nested
//	      objects or arrays)
class HomeWidget extends React.Component {
  static propTypes = {
    data: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.state = {
      pageData: this.props.data
    };
    this.resolvePropName = this.resolvePropName.bind(this);
    this.EnumeratedData = this.EnumeratedData.bind(this);
  }

  resolvePropName(prop) {
    return prop.replace(/_/g, " ");
  }

  EnumeratedData(props) {
    let headerData = [];
    let infoData = [];
    for (var prop in props.pageData) {
      const thisProp = prop;
      headerData.push(<ul>{this.resolvePropName(thisProp)}</ul>);
      infoData.push(<ul>{props.pageData[thisProp]}</ul>);
    }
    return (
      <table>
        <tbody>
          <tr>
            <td className="headerCol">{headerData}</td>
            <td className="infoCol">{infoData} </td>
          </tr>
        </tbody>
      </table>
    );
  }

  render() {
    return <this.EnumeratedData pageData={this.state.pageData} />;
  }
}

export default HomeWidget;
