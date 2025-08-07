import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { User } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { useUpdate } from "./useUpdate";

interface IUseUploadProfilePictureMutation {
  file:File;
  presignedUrl:string
}

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  const { mutate:updateUser } = useUpdate();


  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (param: IUseUploadProfilePictureMutation) => {
 

      const allowedContentTypes = ["image/jpeg", "image/png"];
      const contentType = allowedContentTypes.includes(param.file.type)
        ? param.file.type
        : null;
      if (contentType == null){
        throw new Error('type not match')
      }
        const payload: User.IUploadProfilePicturePayload = {
          uploadImagePreSignedUrl: param.presignedUrl,
          fileStream: param.file,
          contentType: contentType as "image/jpeg" | "image/png",
          fileSize: `${param.file.size}`,
        };



      return await services.api.main.user.uploadProfilePicture(payload);
    },
    onSuccess: (data) => {
      updateUser({ picture: data.uploadedFileName });
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.USER.VIEW_PROFILE] as any);
    },
    onError: (error) => {},
  });
  return {
    mutate,
    isError,
    error,
    pictureUrl:data,
    isPending,
  };
};
