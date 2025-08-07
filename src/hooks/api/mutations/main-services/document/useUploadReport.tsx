import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";


interface IUseUploadProfilePictureMutation {
  file:File;
  presignedUrl:string
}


export const useUploadReport = () => {

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (param: IUseUploadProfilePictureMutation) => {
      const allowedContentTypes = [
          "image/jpeg" ,
          "image/png" ,
          "application/pdf" ,
          "application/msword" ,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const contentType = allowedContentTypes.includes(param.file.type)
        ? param.file.type
        : null;
      if (contentType == null) {
        throw new Error("type not match");
      }
      const payload: Document.IUploadReportPayload = {
        uploadImagePreSignedUrl: param.presignedUrl,
        fileStream: param.file,
        contentType: contentType as
          | "image/jpeg"
          | "image/png"
          | "application/pdf"
          | "application/msword"
          | "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: `${param.file.size}`,
      };

      return await services.api.main.document.uploadReport(payload);
    },
    onSuccess: (data) => {},
    onError: (error) => {},
  });
  return {
    mutate,
    isError,
    error,
    pictureUrl: data,
    isPending,
  };
};
