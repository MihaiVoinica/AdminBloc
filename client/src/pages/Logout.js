// Packages
import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
// Utils
import { logout } from "../utils";

const Logout = React.memo((props) => {
  useEffect(() => {
    logout();
  }, []);

  return <Redirect to="/" />;
});

export default Logout;
