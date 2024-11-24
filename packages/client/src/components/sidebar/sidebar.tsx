import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faArrowRight,
  faCircleUser,
  IconDefinition,
  faChess,
  faAddressCard,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

import "./sidebar.scss";
import { PieceColor, PieceName } from "../../utils/chess";
import { Piece } from "../piece/piece";

type SidebarLinkProps = {
  icon: IconDefinition;
  text: string;
  isActive?: boolean;
  destination: string;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  text,
  destination,
  isActive = false,
}) => {
  const classes = ["sidebar__link"];

  if (isActive) {
    classes.push("sidebar__link--active");
  }
  return (
    <Link to={destination} className={classes.join(" ")}>
      <FontAwesomeIcon className="sidebar__link-icon" icon={icon} />
      <p className="sidebar__link-text">{text}</p>
    </Link>
  );
};

const links: Pick<SidebarLinkProps, "icon" | "text" | "destination">[] = [
  {
    icon: faChess,
    text: "Game",
    destination: "/game",
  },
  {
    icon: faAddressCard,
    text: "Register",
    destination: "/register",
  },
  {
    icon: faRightToBracket,
    text: "Login",
    destination: "/login",
  },
];

export const Sidebar: React.FC = () => {
  const [activeLinkIndex, setActiveLinkIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let activeIndex = -1;
    for (let i = 0; i < links.length; i++) {
      if (links[i].destination === location.pathname) {
        activeIndex = i;
      }
    }

    setActiveLinkIndex(activeIndex);
  }, [location]);

  const sidebarClasses = ["sidebar"];

  if (isActive) {
    sidebarClasses.push("sidebar--active");
  }

  const onSidebarTriggerClick = () => {
    setIsActive(true);
  };

  const onSidebarClose = () => {
    setIsActive(false);
  };

  return (
    <>
      <FontAwesomeIcon
        icon={faBars}
        className="sidebar__trigger"
        onClick={onSidebarTriggerClick}
      />
      <div className={sidebarClasses.join(" ")}>
        <FontAwesomeIcon
          className="sidebar__closer"
          icon={faArrowRight}
          onClick={onSidebarClose}
        />
        <div className="sidebar__header">
          <Piece type={{ color: PieceColor.WHITE, name: PieceName.ROOK }} />
        </div>
        <div className="sidebar__user-section ">
          <FontAwesomeIcon className="sidebar__user-icon" icon={faCircleUser} />
          <p className="sidebar__username">Guest</p>
        </div>
        <hr className="sidebar__divider" />
        {links.map((link, index) => (
          <SidebarLink
            key={link.text}
            icon={link.icon}
            text={link.text}
            isActive={activeLinkIndex == index}
            destination={link.destination}
          />
        ))}
      </div>
    </>
  );
};

export type SidebarLayoutProps = {
  children?: React.ReactNode;
};

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <div className="sidebar-layout__main-content">
        <Outlet />
        {children}
      </div>
    </div>
  );
};
