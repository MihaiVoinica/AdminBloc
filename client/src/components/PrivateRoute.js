// Packages
import React from "react";
import { Route } from "react-router-dom";
// Pages
import NotFound from "../pages/NotFound";
// Utils
import { userHasAccess } from "../utils";

const PrivateRoute = React.memo(
  ({ component: Component, accessRoles = [], ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        userHasAccess(accessRoles) ? <Component {...props} /> : <NotFound />
      }
    />
  )
);

export default PrivateRoute;
