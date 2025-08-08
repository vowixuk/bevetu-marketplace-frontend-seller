import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "../../../../../providers/auth";
import { QUERY_KEYS } from "../../../queryKeys";
import { services } from "../../../../../../services/index";



export const useViewProfile = () => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.USER.VIEW_PROFILE],
    queryFn: async () => {
      try {
         if (!csrfToken) {
           throw new Error("CSRF token is not available.");
         }
        const data = await services.api.main.user.viewProfile({
          csrfToken: csrfToken as string,
        });

        if (data.status === 200) {
          setCsrfToken(data.headers["x-csrf-token"]);
          return data;
        }
        throw new Error();
      } catch (error) {
        return null;
      }
    },

    // Will refetch when the component mounts
    refetchOnMount: true,
    // Will refetch when the window is focused again
    refetchOnWindowFocus: true,
    // This prevents the query from running if csrfToken is null/undefined
    enabled: !!csrfToken,
  });

  return {
    viewProfile: refetch,
    isError,
    error,
    data: data?.data,
    isLoading,
  };
};
