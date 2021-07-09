// Packages
import React from "react";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// Pages
// auth
import Login from "./pages/Login";
import ActivateUser from "./pages/ActivateUser";
import Logout from "./pages/Logout";
// managing
import Apartments from "./pages/Apartments";
import AddApartment from "./pages/AddApartment";
import EditApartment from "./pages/EditApartment";
import Buildings from "./pages/Buildings";
import AddBuilding from "./pages/AddBuilding";
import EditBuilding from "./pages/EditBuilding";
import Register from "./pages/Register";
// home
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
// not found
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
      {/* AUTH ROUTES */}
      <ExclusivePublicRoute exact path="/login" component={Login} />
      <ExclusivePublicRoute
        exact
        path="/activate-user/:token"
        component={ActivateUser}
      />
      <PrivateRoute exact path="/logout" component={Logout} />
      {/* MANAGING ROUTES */}
      <PrivateRoute
        exact
        path="/apartments"
        component={Apartments}
        accessRoles={accessRoles["/apartments"]}
      />
      <PrivateRoute
        exact
        path="/apartments/add"
        component={AddApartment}
        accessRoles={accessRoles["/apartments"]}
      />
      <PrivateRoute
        exact
        path="/apartments/edit/:id"
        component={EditApartment}
        accessRoles={accessRoles["/apartments"]}
      />
      <PrivateRoute
        exact
        path="/buildings"
        component={Buildings}
        accessRoles={accessRoles["/buildings"]}
      />
      <PrivateRoute
        exact
        path="/buildings/add"
        component={AddBuilding}
        accessRoles={accessRoles["/buildings"]}
      />
      <PrivateRoute
        exact
        path="/buildings/edit/:id"
        component={EditBuilding}
        accessRoles={accessRoles["/buildings"]}
      />
      <PrivateRoute
        exact
        path="/register"
        component={Register}
        accessRoles={accessRoles["/register"]}
      />
      {/* HOME ROUTE */}
      <FallbackRoute exact path="/" component={Dashboard} fallback={Landing} />
      {/* NOT FOUND ROUTE */}
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
