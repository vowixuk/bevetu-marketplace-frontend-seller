import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";


export const useViewPublicAccessAllowedAiDiagnosisRecord = (
  payload: Document.IViewPublicAccessAllowedAiDiagnosisRecordPayload
) => {
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [
      QUERY_KEYS.MAIN.DOCUMENT.VIEW_PUBLIC_ACCESS_ALLOWED_AI_DIAGNOSIS_RECORD(
        payload.recordId
      ),
    ],
    queryFn: async () => {
      try {
        const data =
          await services.api.main.document.viewPublicAccessAllowedAiDiagnosisRecord(
            {
              ...payload,
            }
          );


        if (data.status === 201) {
          return data;
        }
        throw new Error();
      } catch (error) {
        return null;
      }
    },


    // Will refetch when the component mounts
    refetchOnMount: false,
    // Will refetch when the window is focused again
    refetchOnWindowFocus: true,
    // This prevents the query from running if csrfToken is null/undefined
    enabled: !!payload.petId && !!payload.password && !!payload.recordId,
  });

  return {
    refetch,
    isError,
    error,
    data: data?.data,
    isLoading,
  };
};
