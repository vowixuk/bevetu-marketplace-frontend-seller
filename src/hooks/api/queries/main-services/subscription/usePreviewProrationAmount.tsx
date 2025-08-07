import { Subscription } from "@services/api/types/main-services.types";
import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { services } from "services/index";

export const usePreviewProrationAmount = (payload:Subscription.IPreviewProrationAmountPayload) => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading, isRefetching } = useQuery({
    queryKey: [],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }
        const data =
          await services.api.main.subscription.previewProrationAmount({
            ...payload,
            csrfToken: csrfToken as string,
          });

        if (data.status === 200) {
          setCsrfToken(data.headers["x-csrf-token"]);
          return data;
        }
        throw new Error();
      } catch (error: any) {
        return null;
      }
    },

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!csrfToken && !!payload.newSeatNo,
  });

  return {
    refetch,
    isError,
    error,
    data: data,
    isLoading,
    isRefetching,
  };
};
