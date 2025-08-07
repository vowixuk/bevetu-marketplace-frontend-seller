import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { services } from "services/index";



export const useViewUserAllSubscriptions = () => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.SUBSCRIPTION.VIEW_USER_ALL_SUBSCRIPTIONS],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }
        const data = await services.api.main.subscription.viewUserAllSubscriptions({
          csrfToken: csrfToken as string,
        });

        if (data.status === 200) {
          setCsrfToken(data.headers["x-csrf-token"]);
          return data;
        }
        throw new Error();
      } catch (error:any) {
          if (
            error.response.data.statusCode === 404 &&
            error.response.data.message === "Subscription not found" &&
            error.response.data.error === "Not Found"
          ) {
            setCsrfToken(error.response.headers["x-csrf-token"]);
            return "No Subscription";
          }
          return null;
 
      }
    },

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!csrfToken,
  });

  return {
    refetch,
    isError,
    error,
    data,
    isLoading,
  };
};
