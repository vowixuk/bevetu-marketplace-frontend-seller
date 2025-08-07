import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { services } from "services/index";
import { Pet } from "services/api/types/main-services.types";
import { AxiosResponse } from "axios";


interface IUseUploadProfilePictureMutation {
  file:File;
  presignedUrl:string
}

export const useUploadProfilePicture = (): UseMutationResult<
  Pet.IUploadProfilePictureReturn,
  Error, 
  IUseUploadProfilePictureMutation 
> => {

  return useMutation({
    mutationFn: async (param: IUseUploadProfilePictureMutation) => {
      const allowedContentTypes = ["image/jpeg", "image/png"];
      const contentType = allowedContentTypes.includes(param.file.type)
        ? param.file.type
        : null;
      if (contentType == null) {
        throw new Error("type not match");
      }
      const payload: Pet.IUploadProfilePicturePayload = {
        uploadImagePreSignedUrl: param.presignedUrl,
        fileStream: param.file,
        contentType: contentType as "image/jpeg" | "image/png",
        fileSize: `${param.file.size}`,
      };

      const response = await services.api.main.pet.uploadProfilePicture(
        payload
      );


      return response;
    },
    onSuccess: (data) => {},
    onError: (error) => {
      console.log(error,"<< error")
    },
  });
};
