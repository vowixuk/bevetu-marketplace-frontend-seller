import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";


export const useGetUploadPresignUrl = () => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (
      payload: Document.IGetUploadPresignedUrlPayload
    ) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      const response = await services.api.main.document.getUploadPresignedUrl({
        ...payload,
        csrfToken,
      });
      return response;
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
    },
    onError: (error) => {},
  });
  return {
    mutate,
    isError,
    error,
    data,
    isPending,
  };
};
