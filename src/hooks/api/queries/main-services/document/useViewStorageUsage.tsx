import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";


export const useViewStorageUsage = (
  payload: Document.IViewStorageUsagePayload,
) => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.DOCUMENT.VIEW_STORAGE_USAGE],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }
        const data = await services.api.main.document.viewStorageUsage({
          ...payload,
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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!csrfToken,
  });

  return {
    refetch,
    isError,
    error,
    data: data?.data,
    isLoading,
  };
};
