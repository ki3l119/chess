import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faArrowRight,
  faCircleUser,
  IconDefinition,
  faChess,
  faAddressCard,
  faRightToBracket,
  faRightFromBracket,
  faCircleChevronLeft,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

import "./sidebar.scss";
import { UserDto } from "chess-shared-types";
import { userService } from "@/services";
import { UserContext } from "@/contexts";
import { Spinner } from "../spinner/spinner";
import { IconButton } from "../icon-button/icon-button";

type SidebarLinkProps = {
  icon: IconDefinition;
  text: string;
  isActive?: boolean;
  /**
   * Either destination or onClick can be defined, but not both.
   */
  destination?: string; // The destination link
  onClick?: () => void;
  isCollapsed: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  text,
  destination,
  isActive = false,
  isCollapsed,
  onClick,
}) => {
  const sidebarLinkClasses = ["sidebar__link"];
  if (isActive) {
    sidebarLinkClasses.push("sidebar__link--active");
  }

  if (isCollapsed) {
    sidebarLinkClasses.push("sidebar__link--collapsed");
  }
  const children = (
    <>
      <FontAwesomeIcon className="sidebar__link-icon" icon={icon} />
      {!isCollapsed && <p className="sidebar__link-text">{text}</p>}
    </>
  );

  const sidebarClassesString = sidebarLinkClasses.join(" ");
  return (
    <>
      {destination ? (
        <Link to={destination} className={sidebarClassesString}>
          {children}
        </Link>
      ) : (
        onClick && (
          <div onClick={onClick} className={sidebarClassesString}>
            {children}
          </div>
        )
      )}
    </>
  );
};

type SidebarProps = {
  user?: UserDto;
  isUserLoading?: boolean;
  onLogout?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  user,
  isUserLoading = false,
  onLogout,
}) => {
  const [activeLinkIndex, setActiveLinkIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const location = useLocation();

  const links: Pick<
    SidebarLinkProps,
    "icon" | "text" | "destination" | "onClick"
  >[] = [
    {
      icon: faChess,
      text: "Game",
      destination: "/game",
    },
  ];

  if (!user) {
    links.push(
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
    );
  } else {
    links.push(
      {
        icon: faAddressCard,
        text: "Profile",
        destination: "/profile",
      },
      {
        icon: faRightFromBracket,
        text: "Logout",
        onClick: onLogout,
      },
    );
  }

  useEffect(() => {
    let activeIndex = -1;
    for (let i = 0; i < links.length; i++) {
      if (links[i].destination === location.pathname) {
        activeIndex = i;
      }
    }

    setActiveLinkIndex(activeIndex);
    setIsExpanded(false);
  }, [location, user]);

  const sidebarClasses = ["sidebar"];
  const sidebarTriggerClasses = ["sidebar__trigger"];

  if (isExpanded) {
    sidebarClasses.push("sidebar--expanded");
    sidebarTriggerClasses.push("sidebar__trigger--close");
  }

  const expandSidebar = () => {
    setIsExpanded(true);
  };

  const collapseSidebar = () => {
    setIsExpanded(false);
  };

  return (
    <>
      {isExpanded && (
        <div className="sidebar-background" onClick={collapseSidebar}></div>
      )}
      <div className={sidebarClasses.join(" ")}>
        <div className={sidebarTriggerClasses.join(" ")}>
          <IconButton
            icon={isExpanded ? faChevronLeft : faChevronRight}
            onClick={isExpanded ? collapseSidebar : expandSidebar}
          />
        </div>
        {isUserLoading ? (
          <div className="sidebar__spinner">
            <Spinner />
          </div>
        ) : (
          <>
            <div
              className={
                "sidebar__user-section" +
                (isExpanded ? "" : " sidebar__user-section--collapsed")
              }
            >
              <FontAwesomeIcon
                className="sidebar__user-icon"
                icon={faCircleUser}
              />

              {isExpanded && (
                <p className="sidebar__username">
                  {user ? user.username : "Guest"}
                </p>
              )}
            </div>
            {/* <hr className="sidebar__divider" /> */}
            <div className="sidebar__links">
              {links.map((link, index) => (
                <SidebarLink
                  key={link.text}
                  icon={link.icon}
                  text={link.text}
                  isActive={activeLinkIndex == index}
                  destination={link.destination}
                  onClick={link.onClick}
                  isCollapsed={!isExpanded}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export type SidebarLayoutProps = {
  children?: React.ReactNode;
};

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<UserDto>();
  const [isUserLoading, setIsUserLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      setIsUserLoading(true);
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      setUser(undefined);
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const onSuccessfulLogin = (user: UserDto) => {
    setUser(user);
  };

  const onLogout = async () => {
    try {
      setIsUserLoading(true);
      await userService.logout();
      setUser(undefined);
      navigate("/login");
    } finally {
      setIsUserLoading(false);
    }
  };

  return (
    <div className="sidebar-layout">
      <Sidebar user={user} isUserLoading={isUserLoading} onLogout={onLogout} />
      <div className="sidebar-layout__main-content">
        {isUserLoading ? (
          <div className="sidebar-layout__spinner">
            <Spinner />
          </div>
        ) : (
          <UserContext.Provider value={{ user, onSuccessfulLogin }}>
            <Outlet />
            {children}
          </UserContext.Provider>
        )}
      </div>
    </div>
  );
};
