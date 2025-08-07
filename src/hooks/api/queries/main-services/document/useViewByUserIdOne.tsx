/**
 *  Use this hook to fetch document for only one pet
 *  Update 2025 Jul 7 
 *  This api endpoint is depreciated
 *  Pending to remove this page
 */

import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";

export const useViewByUserIdOne = (
  payload: Document.IViewByUserIdPayload,
) => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.DOCUMENT.VIEW_BY_USER_ID_ONE(payload.petIds)],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }
        const data = await services.api.main.document.viewByUserId({
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

    // Will refetch when the component mounts
    refetchOnMount: true,
    // Will refetch when the window is focused again
    refetchOnWindowFocus: true,
    // This prevents the query from running if csrfToken is null/undefined
    enabled: !!csrfToken && !!payload.petIds && payload.petIds !== "",
  });

  return {
    refetch,
    isError,
    error,
    data: data?.data,
    isLoading,
  };
};
