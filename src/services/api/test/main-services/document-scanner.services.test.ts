/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/document-scanner.services.test.ts
 */

import {services} from '../../..'
import { deleteUser, userLogin } from './helper';
import * as path from "path";
import * as fs from "fs";
import FormData from "form-data";


describe("document-scanner", () => {
  let accessToken: string = "";
  // let refreshToken: string = "";
  let csrfToken: string = "";
  let blood_report_folder_path =
    "../testing_data/blood-report";

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

      expect(result.email).toBeDefined();
    });
  });

  // GET  https://main.bevetu.com/v1/document-scanner
  describe("serverHealthCheck()", () => {
    it("test 2 - should BVA-01 is running", async () => {
      const response =
        await services.api.main.documentScanner.serverHealthCheck({
          accessToken,
          csrfToken,
          key: 'testing'
        });
      expect(response.data).toBe("OK");
    });
  });

  // POST  https://main.bevetu.com/v1/document-scanner/blood-reports
  describe("predictDogBreed()", () => {
    it("Task 3 - should return the dog breed and probability.", async () => {
      const pathToImage = path.join(
        __dirname,
        blood_report_folder_path,
        "blood-report-6.pdf"
      );

      const fileStream = fs.createReadStream(pathToImage);

      const formData = new FormData();
      formData.append("document", fileStream, "blood-report.jpg");

      const { data } = await services.api.main.documentScanner.scanBloodReport({
        formData: formData,
        accessToken,
        csrfToken,
      });

      console.log(data.data[0], "<< data.data");
      console.log(data.images, "<< data.images");

      expect(data.images).toBeDefined();
      expect(data.data).toBeDefined();
    });
  });
});


