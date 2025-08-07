import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { User } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";

export const useGetUploadProfilePicturePresignedUrl = () => {
  const { setCsrfToken,csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: User.IGetUploadProfilePicturePresignedUrlPayload) => {
      
     if (!csrfToken) {
       throw new Error("CSRF token is not available.");
     }
      const response =
        await services.api.main.user.getUploadProfilePicturePresignedUrl({
          ...payload,
          csrfToken: csrfToken,
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
    presignedUrl:data?.data.url,
    isPending,
  };
};
