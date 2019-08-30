import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "./css/Style.css";
import App from "./App";
import Home from "./Home";
import Activity from "./Activity";
import Account from "./Account";
import Login from "./Login";
import Messages from "./Messages";
import MyVehicles from "./MyVehicles";
import Community from "./Community";
import RegisterUser from "./RegisterUser";
import ForgotPassword from "./ForgotPassword";
import PasswordReset from "./PasswordReset";
import FAQ from "./FAQ";
import ContactUs from "./ContactUs";
import * as serviceWorker from "./registerServiceWorker";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faIgloo,
  faCar,
  faSmile,
  faShieldAlt,
  faLock,
  faHome,
  faCarSide,
  faUserCircle,
  faCalendarAlt,
  faEnvelope,
  faSignOutAlt,
  faQuestionCircle,
  faInfoCircle,
  faBars,
  faHandsHelping,
  faCog,
  faTrashAlt,
  faPlus,
  faBuilding,
  faCaretDown,
  faTachometerAlt,
  faSitemap,
  faKey
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faIgloo,
  faCar,
  faSmile,
  faShieldAlt,
  faLock,
  faHome,
  faCarSide,
  faUserCircle,
  faCalendarAlt,
  faEnvelope,
  faSignOutAlt,
  faQuestionCircle,
  faInfoCircle,
  faBars,
  faHandsHelping,
  faCog,
  faTrashAlt,
  faPlus,
  faBuilding,
  faCaretDown,
  faTachometerAlt,
  faSitemap,
  faKey
);

ReactDOM.render(
  <BrowserRouter>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/Home" component={Home} />
      <Route path="/Activity" component={Activity} />
      <Route path="/Vehicles" component={MyVehicles} />
      <Route path="/Login" component={Login} />
      <Route path="/Messages" component={Messages} />
      <Route path="/Community" component={Community} />
      <Route path="/Account" component={Account} />
      <Route path="/Register" component={RegisterUser} />
      <Route path="/ForgotPassword" component={ForgotPassword} />
      <Route path="/Password" component={PasswordReset} />
      <Route path="/FAQ" component={FAQ} />
      <Route path="/ContactUs" component={ContactUs} />
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.unregister();
