import axios from "axios";

// AxiosGetter - Axios get request handler for all pages
// Usage:
// 	route:         sub-route for GET request
//	callback:      function to handle received
//				         data. Usually initData()
//	callback_fail: function to set dataStatus to
//                 "FAILED" in component's state
export default function AxiosGetter(route, callback, callback_fail) {
  axios
    .get("https://felis-234504.appspot.com/" + route, {
      headers: { Authorization: localStorage.getItem("access_token") }
    })
    .then(response => {
      console.log(response.data);
      callback(response.data);
    })
    .catch(error => {
      console.log(error);
      callback_fail();
    });
}
