import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { services } from "services/index";
import { Pet } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { AxiosResponse } from "axios";


export const useGetUploadPicturePresignUrl = (): UseMutationResult<
  AxiosResponse<Pet.IGetUploadPicturePresignUrlReturn>,
  Error,
  Pet.IGetUploadPicturePresignUrlPayload 
> => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  
  return useMutation({
    mutationFn: async (payload: Pet.IGetUploadPicturePresignUrlPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }
     
      const response = await services.api.main.pet.getUploadPicturePresignUrl({
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
};
