import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { Pet } from "services/api/types/main-services.types";


export const useViewProfilePicture = (payload: Pet.IViewProfilePicturePayload) => {


  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.PET.VIEW_PROFILE_PICTURE(payload.petId)],
    queryFn: async () => {
      if (!payload.url) return null;
      try {
       
        const imageUrl = `${process.env.REACT_APP_STORAGE_ENDPOINT}/${process.env.REACT_APP_S3_BUCKET_PET_PROFILE_PICRURES}/${payload.url}`;
        const response = await fetch(imageUrl);

        if (response.status === 200) {
          const blob = await response.blob();
          const file = new File([blob], payload.url, { type: blob.type });
          return file;
        }
        throw new Error();
      } catch (error) {
        return null;
      }
    },

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!payload.url && !!payload.petId && payload.url !== "",
  });

  return {
    refetch,
    isError,
    error,
    data,
    isLoading,
  };
};
