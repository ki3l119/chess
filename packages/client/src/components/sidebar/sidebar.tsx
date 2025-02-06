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
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

import "./sidebar.scss";
import { PieceColor, PieceName } from "@/pages/game/utils/chess";
import { Piece } from "../piece/piece";
import { UserDto } from "chess-shared-types";
import { userService } from "@/services";
import { UserContext } from "@/contexts";
import { Spinner } from "../spinner/spinner";

type SidebarLinkProps = {
  icon: IconDefinition;
  text: string;
  isActive?: boolean;
  /**
   * Either destination or onClick can be defined, but not both.
   */
  destination?: string;
  onClick?: () => void;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  text,
  destination,
  isActive = false,
  onClick,
}) => {
  const sidebarClasses = ["sidebar__link"];

  if (isActive) {
    sidebarClasses.push("sidebar__link--active");
  }
  const children = (
    <>
      <FontAwesomeIcon className="sidebar__link-icon" icon={icon} />
      <p className="sidebar__link-text">{text}</p>
    </>
  );

  const sidebarClassesString = sidebarClasses.join(" ");
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
  const [isActive, setIsActive] = useState(false);
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
    links.push({
      icon: faRightFromBracket,
      text: "Logout",
      onClick: onLogout,
    });
  }

  useEffect(() => {
    let activeIndex = -1;
    for (let i = 0; i < links.length; i++) {
      if (links[i].destination === location.pathname) {
        activeIndex = i;
      }
    }

    setActiveLinkIndex(activeIndex);
  }, [location, user]);

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
          <div className="sidebar__header-piece">
            <Piece type={{ color: PieceColor.WHITE, name: PieceName.ROOK }} />
          </div>
        </div>
        {isUserLoading ? (
          <div className="sidebar__spinner">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="sidebar__user-section ">
              <FontAwesomeIcon
                className="sidebar__user-icon"
                icon={faCircleUser}
              />
              <p className="sidebar__username">
                {user ? user.username : "Guest"}
              </p>
            </div>
            <hr className="sidebar__divider" />
            {links.map((link, index) => (
              <SidebarLink
                key={link.text}
                icon={link.icon}
                text={link.text}
                isActive={activeLinkIndex == index}
                destination={link.destination}
                onClick={link.onClick}
              />
            ))}
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
