export function getSuccessMessage(response) {
  let msg = "";
  if (response.data) msg = response.data.msg;
  this.setState({
    requestStatus: "SUCCESS",
    responseMessage: msg
  });
}

export function getErrorMessage(err) {
  let msg = "An unknown error occurred";
  if (err.response) {
    console.log(err.response.data.error);
    msg = err.response.data.error;
  } else console.log(err);
  this.setState({
    requestStatus: "FAILURE",
    responseMessage: msg
  });
}
