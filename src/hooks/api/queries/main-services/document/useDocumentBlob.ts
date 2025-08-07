import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "hooks/api/queryKeys";


interface IUseDocumentBlobReturn {
  blobUrl: string;
  type: "pdf" | "image";
}

interface IUseDocumentBlobPayload {
  petId: string;
  url: string;
  reportId: string;
  documentType: string;
}

export const useDocumentBlob = (payload:IUseDocumentBlobPayload) => {
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [
      QUERY_KEYS.MAIN.DOCUMENT.DOCUMENT_BLOB(
        payload.petId,
        payload.documentType,
        payload.reportId
      ),
    ],
    queryFn: async (): Promise<IUseDocumentBlobReturn | null> => {
      try {
        const response = await fetch(payload.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const type = blob.type.includes("pdf") ? "pdf" : "image";

        return {
          blobUrl,
          type,
        };
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled:
      !!payload.documentType &&
      !!payload.reportId &&
      !!payload.petId &&
      !!payload.url,
  });

   return {
     isError,
     refetch,
     error,
     data: data,
     isLoading,
   };
};
