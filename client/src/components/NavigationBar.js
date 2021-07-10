import React, { useCallback, useMemo, useState } from "react";
import { withRouter, Link } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
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
  const isAuthFlag = isAuthenticated();

  const toggle = () => setIsOpen(!isOpen);

  const getAuthRoutes = useCallback(
    () =>
      isAuthFlag ? (
        <NavItem>
          <NavLink tag={Link} to="/logout">
            Logout ({getUserEmail()})
          </NavLink>
        </NavItem>
      ) : (
        <NavItem>
          <NavLink tag={Link} to="/login">
            Login
          </NavLink>
        </NavItem>
      ),
    [isAuthFlag]
  );

  const getOperationsRoutes = useCallback(() => {
    if (!isAuthFlag) return null;

    return (
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          Operatiuni
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem tag={Link} to="/meters">
            Contoare
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }, [isAuthFlag]);

  const getManagingRoutes = useCallback(() => {
    if (!isAuthFlag) return null;

    const routes = [];

    if (userHasAccess(accessRoles["/apartments"])) {
      routes.push((key) => (
        <DropdownItem key={key} tag={Link} to="/apartments">
          Apartamente
        </DropdownItem>
      ));
    }

    if (userHasAccess(accessRoles["/buildings"])) {
      routes.push((key) => (
        <DropdownItem key={key} tag={Link} to="/buildings">
          Blocuri
        </DropdownItem>
      ));
    }

    if (userHasAccess(accessRoles["/register"])) {
      routes.push((key) => (
        <DropdownItem key={key} tag={Link} to="/register">
          Inroleaza utilizator
        </DropdownItem>
      ));
    }

    if (!routes.length) return null;

    return (
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          Administrare
        </DropdownToggle>
        <DropdownMenu right>
          {routes.map((getItem, id) =>
            getItem(`navbar-manage-dropdown-item-${id}`)
          )}
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }, [isAuthFlag]);

  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand tag={Link} to="/">
          AdminBloc
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            {isAuthFlag ? (
              <NavItem>
                <NavLink tag={Link} to="/">
                  Dashboard
                </NavLink>
              </NavItem>
            ) : null}
            {getOperationsRoutes()}
            {getManagingRoutes()}
            {getAuthRoutes()}
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
});

export default withRouter(NavigationBar);
