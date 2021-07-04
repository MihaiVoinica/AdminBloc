// Packages
import React from "react";
import { Route } from "react-router-dom";
// Utils
import { isAuthenticated } from "../utils";

const FallbackRoute = React.memo(
  ({ component: Component, fallback: Fallback, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? <Component {...props} /> : <Fallback {...props} />
      }
    />
  )
);

export default FallbackRoute;
