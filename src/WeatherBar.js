import React from "react";
import PropTypes from "prop-types";
import fetchJsonp from "fetch-jsonp";
import "./css/WeatherBar.css";

WeatherBox.propTypes = {
  weather: PropTypes.any,
  units: PropTypes.any
};

function WeatherBox(props) {
  let icon = "wi wi-small wi-forecast-io-" + props.weather.icon;
  return (
    <div className="weatherBar white center-align">
      <table>
        <tbody>
          <tr>
            <td className="weatherIcon">
              <i className={icon} />
            </td>
            <td className="weatherText">
              <div>
                {Math.ceil(props.weather.temperature)}° {props.units}
              </div>
              <div>{props.weather.summary}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

class WeatherBar extends React.Component {
  static propTypes = {
    weather: PropTypes.any,
    units: PropTypes.any
  };
  constructor(props) {
    super(props);
    this.state = {
      weather: {},
      data: false,
      units: "F"
    };
  }

  componentDidMount() {
    this.getLocalWeather();
  }

  getLocalWeather() {
    let weatherDisplay = this;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        let units = weatherDisplay.state.units === "F" ? "us" : "si";
        let location = lat + "," + lng + "?units=" + units;
        let url =
          "https://api.darksky.net/forecast/fe45735e53a0ab68f52fc859dd375907/" +
          location;
        fetchJsonp(url)
          .then(function(response) {
            return response.json();
          })
          .then(function(json) {
            weatherDisplay.setState({ data: true, weather: json });
          });
      });
    }
  }

  render() {
    if (this.state.data) {
      return (
        <WeatherBox
          weather={this.state.weather.currently}
          units={this.state.units}
        />
      );
    } else {
      return <div />;
    }
  }
}

export default WeatherBar;
