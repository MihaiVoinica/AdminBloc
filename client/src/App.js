// Packages
import React from "react";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import ActivateUser from "./pages/ActivateUser";
import NotFound from "./pages/NotFound";
// Components
import NavigationBar from "./components/NavigationBar";
import ExclusivePublicRoute from "./components/ExclusivePublicRoute";
import FallbackRoute from "./components/FallbackRoute";
import PrivateRoute from "./components/PrivateRoute";
// Utils
import { accessRoles } from "./utils";
// Styling
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = React.memo((props) => (
  <div className="app-container">
    <NavigationBar />
    <Switch>
      <ExclusivePublicRoute exact path="/login" component={Login} />
      <PrivateRoute
        exact
        path="/register"
        component={Register}
        accessRoles={accessRoles["/register"]}
      />
      <PrivateRoute exact path="/logout" component={Logout} />
      <FallbackRoute exact path="/" component={Dashboard} fallback={Landing} />
      <ExclusivePublicRoute
        exact
        path="/activate-user/:token"
        component={ActivateUser}
      />
      <Route path="*" component={NotFound} />
    </Switch>
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </div>
));

export default App;
