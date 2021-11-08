import React from "react";

const MyInput = React.forwardRef((props) => {
  return <input {...props}/>;
});

export default MyInput;
