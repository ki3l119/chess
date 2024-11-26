import { createContext } from "react";

import { UserDto } from "chess-shared-types";

type UserContextValue = {
  user?: UserDto;
  onSuccessfulLogin: (user: UserDto) => void;
};

export const UserContext = createContext<UserContextValue>({
  onSuccessfulLogin: () => {},
});
