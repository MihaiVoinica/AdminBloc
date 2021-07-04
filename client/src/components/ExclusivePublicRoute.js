// Packages
import React from "react";
import { Route } from "react-router-dom";
// Pages
import NotFound from "../pages/NotFound";
// Utils
import { isAuthenticated } from "../utils";

const ExclusivePublicRoute = React.memo(({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      !isAuthenticated() ? <Component {...props} /> : <NotFound />
    }
  />
));

export default ExclusivePublicRoute;
