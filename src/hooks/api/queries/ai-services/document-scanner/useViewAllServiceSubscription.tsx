import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";

import { services } from "services/index";
import { DocumentScanner } from "services/api/types/ai-services.types";
import { QUERY_KEYS } from "hooks/api/queryKeys";


export const useViewAllServiceSubscription = (
  payload: DocumentScanner.IViewAllServiceSubscriptionByUserIdPayload
) => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.AI.DOCUMENT_SCANNER.VIEW_ALL_SERVICE_SUBSCRIPTION],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }
        const data =
          await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
            {
              ...payload,
              csrfToken: csrfToken as string,
            }
          );

        if (data.status === 200) {
          setCsrfToken(data.headers["x-csrf-token"]);
          return data;
        }
        throw new Error();
      } catch (error) {
        return null;
      }
    },


    refetchOnMount: true,
    refetchOnWindowFocus: true,

  });

  return {
    refetch,
    isError,
    error,
    data: data?.data,
    isLoading,
  };
};
