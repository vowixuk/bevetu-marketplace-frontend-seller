/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/pet.services.test.ts
 */

import  {services} from '../../..'
import { Pet } from '../../types/main-services.types';
import { deleteUser, enrollFreeSubscription, userLogin } from './helper';
import path from 'path';
import * as fs from "fs";
import axios from 'axios';

describe("pet", () => {
  let accessToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;

  let pet1_id: string = "";
  let pet2_id: string = "";
  let pet3_id: string = "";

  let uploadImagePreSignedUrl: string = "";
  let pet_testing_pic_folder_path = "../testing_data/pet_profile_pictures";
  let uploadedFileName = "";
  let uploadedFileName_2 = "";

  beforeAll(async () => {
    // Get User login
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
    csrfToken = tokens.csrfToken as string;

  });

  afterAll(async () => {
    await deleteUser({
      accessToken,
      csrfToken,
    });
  });

  // POST  https://main.bevetu.com/v1/pets
  describe("create()", () => {
    it("test 1 - should Not be able to create pet if no subscription", async () => {
      try {
        await services.api.main.pet.create({
          accessToken,
          csrfToken,
          category: "CANINE" as Pet.PetCategoryEnum,
          name: "test pet 1",
          dob: new Date("2015-11-05"),
          gender: "F",
          neuter: false,
          breed: "Iguanasdfasdfsa",
          color: "back",
          picture: null,
          microchipFormat: "AVID",
          microchipNumber: "111-122-333-444",
        });
        // eslint-disable-next-line jest/no-jasmine-globals
        fail('Should be fail')
      } catch (error:any) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(error.status).toBe(400);
      }
    });

    it("test 2 - should create a subscription with 2 seats", async () => {
      const freeTrialSubscription = await enrollFreeSubscription({
        accessToken,
        csrfToken,
      });
      subscriptionId = freeTrialSubscription.id;
    

      // Update the seat no of subscription for this test use
      await services.api.main.subscription.update({
        subscriptionId,
        seatNo: 2,
        accessToken,
        csrfToken,
      });

      const response = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });
      expect(response.data.subscription?.seatNo).toBe(2);
      expect(response.data.pets).toEqual([]);
    });
 
    it("test 3 - should able to add 2 pets", async () => {
      await services.api.main.pet.create({
        accessToken,
        csrfToken,
        category: "CANINE" as Pet.PetCategoryEnum,
        name: "test pet 1",
        dob: new Date("2015-11-05"),
        gender: "F",
        neuter: false,
        customBreed:'haha breed',
        breed: "Iguanasdfasdfsa",
        color: "back",
        picture: null,
        microchipFormat: "AVID",
        microchipNumber: "111-122-333-444",
      });
 
      await services.api.main.pet.create({
        accessToken,
        csrfToken,
        category: "CANINE" as Pet.PetCategoryEnum,
        name: "test pet 2",
        dob: new Date("2015-11-05"),
        gender: "F",
        neuter: true,
        breed: "Iguanasdddddfsa",
        color: "back",
        picture: null,
        customBreed: "pasdfjasdf",
        microchipFormat: "ISO",
        microchipNumber: "222-333-444-555",
      });

      const response = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });
      pet1_id = response.data.pets[0].id;
      pet2_id = response.data.pets[1].id;
      expect(pet1_id).toBeDefined();
      expect(pet2_id).toBeDefined();
    });

    it("test 4 - should NOT be able to add more pet", async () => {
      try {
        await services.api.main.pet.create({
          accessToken,
          csrfToken,
          category: "CANINE" as Pet.PetCategoryEnum,
          name: "BIRD",
          dob: new Date("2021-08-10"),
          gender: "F",
          neuter: false,
          breed: "Persian",
          color: "White",
          picture: null,
        });
        fail("Should be fail");
      } catch (error: any) {
        expect(error.status).toBe(403);
      }
    });
  });

  // GET  https://main.bevetu.com/v1/pets/{petsId}
  describe("viewOne()", () => {
    it("test 5 - should able to view created pet by Id", async () => {

      const response = await services.api.main.pet.viewOne({
        accessToken,
        csrfToken,
        petId: pet1_id
      });

      const pet1 = response.data;
      expect(pet1.id).toBeDefined()
    });
  });

  // PATCH https://main.bevetu.com/v1/pets/{petsId}/remove
  describe("softDelete()", () => {
    it("test 6 - should be able to soft delete pet one", async () => {
      await services.api.main.pet.softDelete({
        accessToken,
        csrfToken,
        petId: pet1_id,
      });
      const {data} = await services.api.main.pet.viewOne({
        accessToken,
        csrfToken,
        petId: pet1_id,
      });
      expect(data.status).toBe('INACTIVE');
    
    });
    it("test 7 - should be able to add 1 more pet after soft delete", async () => {

       await services.api.main.pet.create({
         accessToken,
         csrfToken,
         category: "CANINE" as Pet.PetCategoryEnum,
         name: "BIRD",
         dob: new Date("2021-08-10"),
         gender: "F",
         neuter: false,
         breed: "Persian",
         color: "White",
         picture: null,
       });

        const response = await services.api.main.user.viewProfile({
          accessToken,
          csrfToken,
        });
        expect(response.data.pets.length).toBe(3);
        pet1_id = response.data.pets[0].id;
        pet2_id = response.data.pets[1].id;
        pet3_id = response.data.pets[2].id;
        expect(pet1_id).toBeDefined();
        expect(pet2_id).toBeDefined();
        expect(pet3_id).toBeDefined();
        expect(response.data.pets[0].status).toBe("ACTIVE");
        expect(response.data.pets[1].status).toBe("INACTIVE");
        expect(response.data.pets[2].status).toBe("ACTIVE");
    });
  });

  // PATCH https://main.bevetu.com/v1/pets/{petsId}/reactivated
  describe("reactivate()", () => {
    it("test 8 - should Not be able to reactivate when user has 2 activate pets", async () => {
      try {
        await services.api.main.pet.reactivate({
          accessToken,
          csrfToken,
          petId: pet2_id,
        });
        fail('Should not be inactivated')
      } catch(error:any){
        expect(error.status).toBe(403)
      }
    });
    it("test 9 - should be able to reactivate when user has soft delete 1 pet", async () => {
       await services.api.main.pet.softDelete({
         accessToken,
         csrfToken,
         petId: pet1_id,
       });
      await services.api.main.pet.reactivate({
        accessToken,
        csrfToken,
        petId: pet2_id,
      });
      const { data:pet1 } = await services.api.main.pet.viewOne({
        accessToken,
        csrfToken,
        petId: pet1_id,
      });

      const { data: pet2 } = await services.api.main.pet.viewOne({
        accessToken,
        csrfToken,
        petId: pet2_id,
      });

      expect(pet1.status).toBe("INACTIVE");
      expect(pet2.status).toBe("ACTIVE");

    });
    it("test 10 - should Not be able to reactivate the same pet", async () => {});
  });

  // PATCH https://main.bevetu.com/v1/pets/{petId}
  describe("update()", () => {
    it("test 11 - should not change data if optional field if they are not filled when updating the pet 2", async () => {
       await services.api.main.pet.update({
         name:'peter pan',
         accessToken,
         csrfToken,
         petId: pet2_id,
       });

       const { data: pet2 } = await services.api.main.pet.viewOne({
         accessToken,
         csrfToken,
         petId: pet2_id,
       });

      expect(pet2.name).toBe('peter pan')
      expect(pet2.customBreed).not.toBeNull();
      expect(pet2.microchipFormat).not.toBeNull();
      expect(pet2.microchipNumber).not.toBeNull();

    });
    it("test 12 - should change data type to null in optional field when updating the pet 2", async () => {
      const { data: pet2B4 } = await services.api.main.pet.viewOne({
        accessToken,
        csrfToken,
        petId: pet2_id,
      });

      await services.api.main.pet.update({
        customBreed: null,
        microchipFormat: null,
        microchipNumber: null,
        accessToken,
        csrfToken,
        petId: pet2_id,
      });

      const { data: pet2 } = await services.api.main.pet.viewOne({
        accessToken,
        csrfToken,
        petId: pet2_id,
      });
      
      expect(pet2B4.customBreed).not.toBeNull();
      expect(pet2B4.microchipFormat).not.toBeNull();
      expect(pet2B4.microchipNumber).not.toBeNull();

      expect(pet2.customBreed).toBeNull();
      expect(pet2.microchipFormat).toBeNull();
      expect(pet2.microchipNumber).toBeNull();
    });
  });


  // DELETE https://main.bevetu.com/v1/pets/{petId}
  describe("delete()", () => {
    it("test 13 - should delete the first pet", async () => {
      await services.api.main.pet.delete({
        petId: pet1_id,
        accessToken,
        csrfToken,
      });

      const response = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });
      expect(response.data.pets.length).toBe(2);
    });
  });

  // POST  https://main.bevetu.com/v1/pets/profile-picture-upload-url
  describe("getUploadPicturePresignUrl()", () => {
     it("test 14 - should be able to get the upload image presigned url", async () => {
       const imageName = "dog.jpg";

       const response = await services.api.main.pet.getUploadPicturePresignUrl({
         fileName: imageName,
         accessToken,
         csrfToken,
       });
     
       uploadImagePreSignedUrl = response.data.url;

       const presignedUrl = uploadImagePreSignedUrl;
       const startsWithBaseUrl = presignedUrl.startsWith(
         process.env.REACT_APP_STORAGE_ENDPOINT as string
       );
       expect(startsWithBaseUrl).toBe(true);
     });
  });

  // POST  https://main.bevetu.com/v1/pets/profile-picture-upload-url
  describe("upload picture to storage", () => {
   it("test 15 - should be able to upload the file to Storage after fetching the upload image presigned url", async () => {
     const pathToImages = path.join(
       __dirname,
       pet_testing_pic_folder_path,
       "dog.jpg"
     );

     const fileStream = fs.createReadStream(pathToImages);
     const fileStats = fs.statSync(pathToImages);

     const response = await axios.put(uploadImagePreSignedUrl, fileStream, {
       headers: {
         ...(process.env.REACT_APP_STORAGE_RPOVIDER === "azure"
           ? { "x-ms-blob-type": "BlockBlob" }
           : {}),
         "Content-Type": "image/jpeg",
         "Content-Length": fileStats.size,
       },
     });

   
     const parsedUrl = new URL(response.config.url as string);
     const pathname = parsedUrl.pathname;
     uploadedFileName = pathname!.split("/").pop()!.split("?")[0];
     expect(response.status).toBe(200);
   });
  });

  it("test 16 - should be able to access the profile picture", async () => {
    const fileUrl = `${process.env.REACT_APP_STORAGE_ENDPOINT}/${process.env.REACT_APP_S3_BUCKET_PET_PROFILE_PICRURES}/${uploadedFileName}`;
    const response = await axios.get(fileUrl);
    expect(response.status).toBe(200);
    
  });

  it("test 17 - should be able to update the profile picture for Pet 2", async () => {
    await services.api.main.pet.update({
      picture: uploadedFileName,
      accessToken,
      csrfToken,
      petId: pet2_id,
    });
    const { data } = await services.api.main.pet.viewOne({
      accessToken,
      csrfToken,
      petId: pet2_id,
    });
    expect(data.picture).toBe(uploadedFileName);
  });


  it("test 18 - should be able to update another new profile picture for Pet 2", async () => {
    /** Step 1 - Get the new presinged url */
    const imageName = "dog.jpg";
    const response = await services.api.main.pet.getUploadPicturePresignUrl(
      {
        fileName: imageName,
        accessToken,
        csrfToken,
      }
    );
    const uploadImagePreSignedUrl_2 = response.data.url

    /** Step 2 - Update file */
    const pathToImages = path.join(
      __dirname,
      pet_testing_pic_folder_path,
      imageName
    );
    const fileStream = fs.createReadStream(pathToImages);
    const fileStats = fs.statSync(pathToImages);

    const response2 = await axios.put(uploadImagePreSignedUrl_2, fileStream, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": fileStats.size,
      },
    });
    const parsedUrl = new URL(response2.config.url as string);
    const pathname = parsedUrl.pathname;
    uploadedFileName_2 = pathname!.split("/").pop()!.split("?")[0];

    await services.api.main.pet.update({
      picture: uploadedFileName_2,
      accessToken,
      csrfToken,
      petId: pet2_id,
    });
    const { data } = await services.api.main.pet.viewOne({
      accessToken,
      csrfToken,
      petId: pet2_id,
    });

    expect(data.picture).toBe(uploadedFileName_2);
  });

  it("test 19 - should the new picture still be there after updating other pet data", async () => {
    await services.api.main.pet.update({
      accessToken,
      csrfToken,
      name: "new pet 2",
      petId: pet2_id,
    });
    const { data } = await services.api.main.pet.viewOne({
      accessToken,
      csrfToken,
      petId: pet2_id,
    });

    expect(data.name).toBe("new pet 2");
    expect(data.picture).toBe(uploadedFileName_2);
  })


  it("test 19 - should the picture field be set to `null` after after updating `picture == null`", async () => {
    await services.api.main.pet.update({
      accessToken,
      csrfToken,
      picture: null,
      petId: pet2_id,
    });
    const { data } = await services.api.main.pet.viewOne({
      accessToken,
      csrfToken,
      petId: pet2_id,
    });
    expect(data.picture).toBeNull();
  });
});


