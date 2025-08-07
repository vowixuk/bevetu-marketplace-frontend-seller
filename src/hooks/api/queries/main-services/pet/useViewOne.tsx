import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { services } from "services/index";
import { Pet } from "services/api/types/main-services.types";


export const useViewOne = (payload: Pet.IViewOnePayload) => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.PET.VIEW_ONE(payload.petId)],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }

        const data = await services.api.main.pet.viewOne({
          ...payload,
          csrfToken: csrfToken as string,
        });

        if (data.status === 200) {
          setCsrfToken(data.headers["x-csrf-token"]);
          return data;
        }
        throw new Error();
      } catch (error) {
        // setCsrfToken(null);
        
        return null;
      }
    },

    // Will refetch when the component mounts
    refetchOnMount: true,
    // Will refetch when the window is focused again
    refetchOnWindowFocus: true,
    // This prevents the query from running if csrfToken is null/undefined
    enabled: !!csrfToken && !!payload.petId,
  });

  return {
    refetch,
    isError,
    error,
    data: data?.data,
    isLoading,
  };
};
