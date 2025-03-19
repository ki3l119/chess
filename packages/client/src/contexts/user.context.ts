import { createContext, useContext } from "react";

import { UserDto } from "chess-shared-types";

type UserContextValue = {
  user?: UserDto;
  onSuccessfulLogin: (user: UserDto) => void;
};

export const UserContext = createContext<UserContextValue>({
  onSuccessfulLogin: () => {},
});

/**
 * Hook to obtain the current user set in the user context.
 *
 * Throws an error if user is not set.
 */
export const useUser = () => {
  const { user } = useContext(UserContext);
  if (!user) {
    throw new Error("User is not defined in the current context.");
  }
  return user;
};
