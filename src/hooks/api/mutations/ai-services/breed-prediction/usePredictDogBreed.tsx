import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { BreedPrediction } from "services/api/types/ai-services.types";
import { IAuthContext, useAuthContext } from "context";


export const usePredictDogBreed = () => {
  
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: BreedPrediction.IPredictDogBreedPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      return await services.api.ai.breedPrediction.predictDogBreed({
        ...payload,
        csrfToken,
      });


    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
   
    },
    onError: (error) => {

      console.log(error,"<<< error usePredictDogBreed")
    },
  });
  return {
    mutate,
    isError,
    error,
    data,
    isPending,
  };
};
