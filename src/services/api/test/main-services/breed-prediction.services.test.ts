/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/breed-prediction.services.test.ts
 */

import {services} from '../../..'
import { deleteUser, userLogin } from './helper';
import * as path from "path";
import * as fs from "fs";
import FormData from "form-data";


describe("breed-prediction", () => {
  let accessToken: string = "";
  // let refreshToken: string = "";
  let csrfToken: string = "";
  let pet_testing_pic_folder_path = "../testing_data/pet_profile_pictures";


  beforeAll(async () => {
    // Sign up
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
    // refreshToken = tokens.refreshToken as string;
    csrfToken = tokens.csrfToken as string;
  });

  afterAll(async () => {
    await deleteUser({
      accessToken,
      csrfToken,
    });
  });

  describe("Setting Check", () => {
    it("task 1 - should user created and authenticated", async () => {
      const { data: result } = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });

      expect(result.email).toBeDefined()
    });
  });

  // GET  https://main.bevetu.com/v1/breed-prediction
  describe("serverHealthCheck()", () => {
    it("test 2 - should BVA-00 is running", async () => {
      const response = await services.api.main.breedPrediction.serverHealthCheck({
        accessToken,
        csrfToken,
      });
      expect(response.data).toBe('OK')
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/blood-reports/{reportId}
  describe("predictDogBreed()", () => {
    it("Task 3 - should return the dog breed and probability.", async () => {
      const pathToImage = path.join(
        __dirname,
        pet_testing_pic_folder_path,
        "dog.jpg"
      );

      const fileStream = fs.createReadStream(pathToImage);

      const formData = new FormData();
      formData.append("file", fileStream, "dog.jpg");

      const { data } =
        await services.api.main.breedPrediction.predictDogBreed({
          formData:formData,
          accessToken,
          csrfToken,
        });

      expect(data.breed).toBeDefined();
      expect(data.probability).toBeDefined();
    });
  });

});


