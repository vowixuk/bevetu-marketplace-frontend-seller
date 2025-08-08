
import { useCheckSession } from "../../hooks/api/queries"
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";

export interface IUser {
  email: string;
  familyName: string;
  givenName: string;
  isNewUser: boolean;
  picture: string | null;
}

// --- Context details --- //
export interface IAuthContext {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;

  /**
   * determine is the user pass the authentication
   */
  isAuth: boolean;
  setIsAuth: Dispatch<SetStateAction<boolean>>;

  /**
   * Csrf token is required in most of the request
   */
  csrfToken: string | null;
  setCsrfToken: Dispatch<SetStateAction<string | null>>;

  /**
   * `accessToken` and `refreshToken` are only required in mobile application
   */
  accessToken: string | null;
  refreshToken: string | null;

  /**
   * true when still fetching the auth status
   */
  isLoading: boolean;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
  setRefreshToken: Dispatch<SetStateAction<string | null>>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

// --- Consumer --- //
export const useAuthContext = () => useContext(AuthContext);

// --- Provider --- //
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
    
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<IUser | null>(null);


  /**
   * Call the useCheckSession hook here to check the session
   * Check session will be referched every 15min
   * Ensure user's session is valid
   * All will refresh user's csrf token
   */
  const { checkSession,isLoading } = useCheckSession({
    setIsAuth,
    setCsrfToken,
  });


  useEffect(() => {
    checkSession();
  }, []);

  /**
   * values that are output from this provider
   */
  const contextValue: IAuthContext = {
    user,
    setUser,
    isAuth,
    setIsAuth,
    isLoading,
    csrfToken,
    setCsrfToken,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};


