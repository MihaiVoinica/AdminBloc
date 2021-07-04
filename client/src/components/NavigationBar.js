import React, { useState } from "react";
import { withRouter, Link } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
// Utils
import {
  isAuthenticated,
  userHasAccess,
  accessRoles,
  getUserEmail,
} from "../utils";
// Styling
import "./NavigationBar.css";

const NavigationBar = React.memo((props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand tag={Link} to="/">
          AdminBloc
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            {isAuthenticated() ? (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/">
                    Dashboard
                  </NavLink>
                </NavItem>
                {userHasAccess(accessRoles["/register"]) ? (
                  <NavItem>
                    <NavLink tag={Link} to="/register">
                      Register
                    </NavLink>
                  </NavItem>
                ) : null}
                <NavItem>
                  <NavLink tag={Link} to="/logout">
                    Logout ({getUserEmail()})
                  </NavLink>
                </NavItem>
              </>
            ) : (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/login">
                    Login
                  </NavLink>
                </NavItem>
              </>
            )}
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
});

export default withRouter(NavigationBar);
