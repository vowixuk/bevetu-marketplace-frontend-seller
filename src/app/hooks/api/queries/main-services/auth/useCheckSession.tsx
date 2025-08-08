import { useQuery } from "@tanstack/react-query";
import { IUser } from "../../../../../providers";
import { QUERY_KEYS } from "../../../queryKeys";
import { services } from "../../../../../../services/index";

export interface IUseCheckSession {
  setCsrfToken: React.Dispatch<React.SetStateAction<string | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
} 

export const useCheckSession = ({
  setIsAuth,
  setCsrfToken,
}: IUseCheckSession) => {
  const { data, error, isError, refetch,isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.AUTH.CHECK_SESSION],
    queryFn: async () => {
      try {
        const data = await services.api.main.auth.checkSession({});


        if (data.status !== 200) {
          throw new Error();
        } else {
          console.log(
            `check session success at ${new Date().toLocaleTimeString()}`
          );
          setCsrfToken(data.headers["x-csrf-token"]);
          setIsAuth(true);        
        }
        return data;
      } catch {
        console.error(
          `check session fail at ${new Date().toLocaleTimeString()}`
        );
        setIsAuth(false);
        setCsrfToken(null);
        return null;
      }
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15min
  });

  return {
    checkSession: refetch,
    isError,
    isLoading,
    error,
    data,
  };
};
