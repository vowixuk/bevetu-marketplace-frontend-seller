/// <reference types="jest" />

/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/subscription.services.test.ts
 */

import puppeteer from "puppeteer";
import { services } from "../../..";
import { Subscription } from "../../types/main-services.types";
import {
  userLogin,
  deleteUser,
  deleteStripeCustomer,
  fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange,
} from "./helper";
import exp from "constants";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("subscription", () => {
  let accessToken: string = "";
  let refreshToken: string = "";
  let csrfToken: string = "";

  let freeTrialSubscriptionId = "";
  let bevetuPaidSubscription: Subscription.ISubscription;
  let testClockId = "";

  beforeAll(async () => {
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
    refreshToken = tokens.refreshToken as string;
    csrfToken = tokens.csrfToken as string;
  });

  afterAll(async () => {
    // if (bevetuPaidSubscription){

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await deleteStripeCustomer(
      { accessToken, csrfToken },
      bevetuPaidSubscription.id
    );
    // }

    await deleteUser({
      accessToken,
      csrfToken,
    });
  });

  //POST  https://main.bevetu.com/v1/subscriptions/free-trial
  describe("enrollFreeTrial()", () => {
    it("test 1 - should be able to enroll in free trial subscription", async () => {
      const response = await services.api.main.subscription.enrollFreeTrial({
        csrfToken,
        accessToken,
      });

      const { id, freeTrialExpiryDate } = response.data;

      expect(id).toBeDefined();
      freeTrialSubscriptionId = id;

      const subscriptionMeResponse =
        await services.api.main.subscription.viewUserRecentSubscription({
          csrfToken,
          accessToken,
        });

      const result = subscriptionMeResponse.data;

      expect(result.nextPaymentDate).toBe(freeTrialExpiryDate);
      expect(result.productCode).toBe("BVT_FREE_TRIAL");
      expect(result.seatNo).toBe(1);

      expect(result.status).toBe("ACTIVE");
      expect(result.eventRecords.length).toBe(1);
      expect(result.eventRecords[0].type).toBe("CREATE");
      expect(result.eventRecords[0].metadata).toEqual({
        productCode: "BVT_FREE_TRIAL",
        productName: "Bevetu Free Trial (USD)",
        productMode: "Monthly",
      });
      expect(result.cancelAt).toBeNull();
    });

    it("test 2 - should NOT be able to enroll in free trial subscription again with same user", async () => {
      await expect(
        services.api.main.subscription.enrollFreeTrial({
          csrfToken,
          accessToken,
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            message: "User has subscription before",
          },
        },
      });
    });

    /**
     * we do expire free trial anymore
     */
    it.skip("test 3 - should be able to set the nextpayment date to  expiry (make sure backend cron job set 1s)", async () => {
      const today = new Date();
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);

      await services.api.main.subscription.update({
        nextPaymentDate: lastYear,
        subscriptionId: freeTrialSubscriptionId,
        accessToken,
        csrfToken,
      });

      await delay(5000);
    }, 6000);

    /**
     * we do expire free trial anymore
     */
    it.skip("test 4 - should be able to expiry the free trial subscription", async () => {
      const subscriptionMeResponse =
        await services.api.main.subscription.viewUserRecentSubscription({
          csrfToken,
          accessToken,
        });

      const result = subscriptionMeResponse.data;
      expect(result.status).toBe("FREE_TRIAL_EXPIRED");
    });
  });

  //POST  https://main.bevetu.com/v1/subscriptions/paymentLink
  describe("createPaymentLink()", () => {
    let paymentLink = "";
    it("test 5 - should return an payment link", async () => {
      const response = await services.api.main.subscription.createPaymentLink({
        productCode: "BVT_MONTHLY_GBP",
        seatNo: 2,
        csrfToken,
        accessToken,
      });

      const data = response.data;
      paymentLink = data.paymentLink;
      expect(paymentLink).toBeDefined();
    });

    it("test 6 - should access the payment link and make the payment", async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      try {
        await page.goto(paymentLink);
        await page.waitForSelector("#cardNumber");
        // await page.type("#email", "testingUser@bevetu.com");
        await page.type("#cardNumber", "4242424242424242");
        await page.type("#cardExpiry", "12/34");
        await page.type("#cardCvc", "123");
        await page.type("#billingName", "herman");
        await page.type("#billingPostalCode", "M50 2AJ");
        await page.click(".SubmitButton");
        await Promise.all([
          page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 30000,
          }),
          page.click(".SubmitButton"),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        await browser.close();
      }
    }, 30000);

    it("test 7 - should trigger Stripe webhook to create new subscription after successful payment (database should be updated)", async () => {
      const subscriptionMeResponse =
        await services.api.main.subscription.viewUserRecentSubscription({
          csrfToken,
          accessToken,
        });

      const result = subscriptionMeResponse.data;

      bevetuPaidSubscription = result;

      const eventsRecords = result.eventRecords.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      expect(result.status).toBe("ACTIVE");
      expect(result.productCode).toBe("BVT_MONTHLY_GBP");
      expect(result.seatNo).toBe(2);
      expect(eventsRecords.length).toBe(2);
    });
  });

  // GET  https://main.bevetu.com/v1/subscriptions/stripe/{subscriptionId}/
  describe("viewStripeSubscription()", () => {
    it("test 8 - should be able to find subscription record in Stripe after payment", async () => {
      // try {
        const response =
          await services.api.main.subscription.viewStripeSubscription({
            bevetuSubscriptionId: bevetuPaidSubscription.id,
            accessToken,
            csrfToken,
          });
        const result = response.data;

        testClockId = result.test_clock;



        expect(result.metadata.bevetuSubscriptionId).toBe(
          bevetuPaidSubscription.id
        );
        expect(result.quantity).toBe(2);
      // } catch (e: any) {
      //   console.log(e, "<< e");
      // }
    });
  });
  //POST  https://main.bevetu.com/v1/subscriptions/change-seat-number
  describe("changeSeatNo()", () => {
    it("test 9b - test 10b - should be able to preview the protation amount before add seat to 30", async () => {
      // try{
      const response =
        await services.api.main.subscription.previewProrationAmount({
          newSeatNo: 30,
          accessToken,
          csrfToken,
        });

        expect(response.data.prorationAmount).toBeDefined();
    });

    it("test 9b - should be able to add seat to 30 no and charged immediately and update the event records", async () => {
      await services.api.main.subscription.changeSeatNo({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        newSeatNo: 30,
        accessToken,
        csrfToken,
      });

      const { bevetuSubscription, eventsRecords, stripeSubscription } =
        (await fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange(
          { accessToken, csrfToken },
          bevetuPaidSubscription.id
        )) as any;

      expect(stripeSubscription.items.data[0].quantity).toBe(30);
      expect(stripeSubscription.canceled_at).toBeNull();
      expect(bevetuSubscription.seatNo).toBe(30);
      expect(eventsRecords.length).toBe(4);
      expect(eventsRecords[0].type).toBe("CREATE");
      expect(eventsRecords[1].type).toBe("PAYMENT");
      expect(eventsRecords[2].type).toBe("SEAT_AMEND");
      expect(eventsRecords[3].type).toBe("SEAT_AMEND_COMPLETE");
    });

    it("test 10 - should throw error if update seat no equal to the curret seat no", async () => {
      try {
        await services.api.main.subscription.changeSeatNo({
          bevetuSubscriptionId: bevetuPaidSubscription.id,
          newSeatNo: 30,
          accessToken,
          csrfToken,
        });
      } catch (error: any) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(error.status).toBe(400);
        // eslint-disable-next-line jest/no-conditional-expect
        expect(error.response.data.message).toBe(
          "The new seat number same as the current one"
        );
      }
    });

    it("test 11 -  should be able to reduce seat no and effect in next billing cycle  and update the event records", async () => {
      await services.api.main.subscription.changeSeatNo({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        newSeatNo: 5,
        accessToken,
        csrfToken,
      });

      const { bevetuSubscription, eventsRecords, stripeSubscription } =
        (await fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange(
          { accessToken, csrfToken },
          bevetuPaidSubscription.id
        )) as any;

      expect(stripeSubscription.items.data[0].quantity).toBe(5);
      expect(stripeSubscription.canceled_at).toBeNull();
      expect(bevetuSubscription.seatNo).toBe(5);

      expect(eventsRecords.length).toBe(6);
      expect(eventsRecords[0].type).toBe("CREATE");
      expect(eventsRecords[1].type).toBe("PAYMENT");
      expect(eventsRecords[2].type).toBe("SEAT_AMEND");
      expect(eventsRecords[3].type).toBe("SEAT_AMEND_COMPLETE");
      expect(eventsRecords[4].type).toBe("SEAT_AMEND");
      expect(eventsRecords[5].type).toBe("SEAT_AMEND_COMPLETE");
    });
  });
  //POST  https://main.bevetu.com/v1/subscriptions/cancel
  describe("cancelSubscription()", () => {
    it("test 12 - should be able to cancel the subscription and update the event records", async () => {
      await services.api.main.subscription.cancelSubscription({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        cancelReason: "I dun like it",
        accessToken,
        csrfToken,
      });

      const { bevetuSubscription, eventsRecords, stripeSubscription } =
        (await fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange(
          { accessToken, csrfToken },
          bevetuPaidSubscription.id
        )) as any;

      expect(stripeSubscription.cancel_at_period_end).toBe(true);
      expect(bevetuSubscription.status).toBe("CANCELLING");
      expect(eventsRecords.length).toBe(7);
      expect(eventsRecords[6].type).toBe("PENDING_CANCEL");
      expect(eventsRecords[6].metadata["cancelReason"]).toBe("I dun like it");
    });
  });
  //POST  https://main.bevetu.com/v1/subscriptions/restore
  describe("restoreSubscription()", () => {
    it("test 13 - should be able to restore the cancelling subscription  and update the event records", async () => {
      // Update in useCase function
      await services.api.main.subscription.restoreSubscription({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        accessToken,
        csrfToken,
      });

      const { bevetuSubscription, eventsRecords, stripeSubscription } =
        (await fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange(
          { accessToken, csrfToken },
          bevetuPaidSubscription.id
        )) as any;

      expect(stripeSubscription.items.data[0].quantity).toBe(5);
      expect(stripeSubscription.cancel_at_period_end).toBe(false);
      expect(bevetuSubscription.status).toBe("ACTIVE");
      expect(eventsRecords.length).toBe(8);
      expect(eventsRecords[7].type).toBe("RESTORE");
    });
  });

  describe("advanceTestClock()", () => {
    it("test 14 - shoud be able to trigger the payment success webhook event", async () => {
      await services.api.main.subscription.advanceTestClock({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        accessToken,
        csrfToken,
        advanceDay: 32,
        testClockId,
      });

      const pollForEvent = async () => {
        const MAX_RETRIES = 10; // Maximum attempts
        const DELAY = 1000; // Wait 1 second between attempts

        for (let i = 0; i < MAX_RETRIES; i++) {
          const { bevetuSubscription, eventsRecords, stripeSubscription } =
            (await fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange(
              { accessToken, csrfToken },
              bevetuPaidSubscription.id
            )) as any;

          // console.log(stripeSubscription, "<< stripeSubscription");
          // console.log(bevetuSubscription, "<< bevetuSubscription");
          // console.log(eventsRecords, "<< eventsRecords");

          // Check if the latest event is PAYMENT_SUCCESS
          if (
            eventsRecords &&
            eventsRecords[eventsRecords.length - 1].type === "PAYMENT_SUCCESS"
          ) {
            return { bevetuSubscription, eventsRecords, stripeSubscription };
          }

          // Wait before the next retry
          await new Promise((resolve) => setTimeout(resolve, DELAY));
        }

        throw new Error("PAYMENT_SUCCESS event was not triggered in time.");
      };

      // Wait for the event to be processed
      const { eventsRecords } = await pollForEvent();

      // Final assertions
      expect(eventsRecords[eventsRecords.length - 1].type).toBe(
        "PAYMENT_SUCCESS"
      );
    }, 30000);
  });
  //GET  https://main.bevetu.com/v1/subscriptions/products
  describe("viewAllProducts()", () => {
    it("test 15 - should be able to view all the products", async () => {
      const response = await services.api.main.subscription.viewAllProducts({
        accessToken,
        csrfToken,
      });

      const products = response.data;
      expect(products).toEqual(expectedProducts(false));
    });
  });
  //GET  https://main.bevetu.com/v1/subscriptions/me/all
  describe("viewUserAllSubscriptions()", () => {
    it("test 16 - should be able to view user all subscriptions", async () => {
      const response =
        await services.api.main.subscription.viewUserAllSubscriptions({
          accessToken,
          csrfToken,
        });

      const subscriptions = response.data;
      const activePlan = subscriptions.filter((sub) => sub.status == "ACTIVE");
      expect(subscriptions.length).toBe(2);
      expect(subscriptions[0].productCode).toBe("BVT_FREE_TRIAL");
      expect(subscriptions[1].productCode).toBe("BVT_MONTHLY_GBP");
      expect(activePlan.length).toBe(1);
    });
  });

  describe.skip("cancelSubscription() + advanceTestClock()", () => {
    /* The time delay between Stripe sending events and the backend processing them can impact the test results.
     * For example, the test might finish before the event is sent or the backend completes its action.
     * More it will also need to wait for backend to complete test 14 , if testing a full testing
     * Therefore, manual testing is recommended for testing webhooks.
     **/

    it("test 17 - should trigger webhook event `customer.subscription.deleted (use mannual test)`", async () => {
      await services.api.main.subscription.cancelSubscription({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        cancelReason: "I dun like it again",
        accessToken,
        csrfToken,
      });

      await services.api.main.subscription.advanceTestClock({
        bevetuSubscriptionId: bevetuPaidSubscription.id,
        accessToken,
        csrfToken,
        advanceDay: 32,
        testClockId,
      });

      const pollForEvent = async () => {
        const MAX_RETRIES = 30; // Maximum attempts
        const DELAY = 1000; // Wait 1 second between attempts

        for (let i = 0; i < MAX_RETRIES; i++) {
          const response =
            await services.api.main.subscription.viewUserAllSubscriptions({
              accessToken,
              csrfToken,
            });

          const bevetuSubscriptions = response.data;
          const eventRecords = bevetuSubscriptions[1].eventRecords;
          // console.log(stripeSubscription, "<< stripeSubscription");
          //  console.log(bevetuSubscriptions[1], "<< bevetuSubscription");
          //  console.log(eventRecords, "<< eventsRecords");

          if (
            eventRecords &&
            eventRecords[eventRecords.length - 1].type === "CANCELLED"
          ) {
            return { bevetuSubscriptions, eventRecords };
          }

          await new Promise((resolve) => setTimeout(resolve, DELAY));
        }

        throw new Error(
          "`customer.subscription.deleted` event was not triggered in time."
        );
      };

      const { eventRecords } = await pollForEvent();

      const index: number = eventRecords.length > 0 ? eventRecords.length : 0;
      expect(eventRecords[index].type).toBe("CANCELLED");
    });
  });
});

export const AllFeatures = [
  {
    id: "feature1",
    code: "F1",
    name: "Feature 1",
    description: "Description of feature 1.",
  },
  {
    id: "feature2",
    code: "F2",
    name: "Feature 2",
    description: "Description of feature 2.",
  },
];

const PRICE = {
  BVT_FREE_TRIAL: 0,
  BVT_ANNUAL_USD: 108,
  BVT_MONTHLY_USD: 10.8,
  BVT_ANNUAL_GBP: 80,
  BVT_MONTHLY_GBP: 8,
  BVT_ANNUAL_HKD: 840,
  BVT_MONTHLY_HKD: 84,
  BVT_MONTHLY_TESTING: 0,
  BVT_ANNUAL_TESTING: 0,
};

function expectedProducts(showTestProduct: boolean) {
  const products = {
    BVT_FREE_TRIAL: {
      name: "Bevetu Free Trial (USD)",
      code: "BVT_FREE_TRIAL",
      description: "An free subscription plan",
      features: AllFeatures,
      price: PRICE.BVT_FREE_TRIAL,
      currency: "USD",
      mode: "Monthly",
    },
    BVT_ANNUAL_USD: {
      name: "Bevetu Annual Subscription (USD)",
      code: "BVT_ANNUAL_USD",
      description: "An annual subscription plan billed in USD.",
      features: AllFeatures,
      price: PRICE.BVT_ANNUAL_USD,
      currency: "USD",
      mode: "Annual",
    },
    BVT_MONTHLY_USD: {
      name: "Bevetu Monthly Subscription (USD)",
      code: "BVT_MONTHLY_USD",
      description: "A monthly subscription plan billed in USD.",
      features: AllFeatures,
      price: PRICE.BVT_MONTHLY_USD,
      currency: "USD",
      mode: "Monthly",
    },
    BVT_ANNUAL_GBP: {
      name: "Bevetu Annual Subscription (GBP)",
      code: "BVT_ANNUAL_GBP",
      description: "An annual subscription plan billed in GBP.",
      features: AllFeatures,
      price: PRICE.BVT_ANNUAL_GBP,
      currency: "GBP",
      mode: "Annual",
    },
    BVT_MONTHLY_GBP: {
      name: "Bevetu Monthly Subscription (GBP)",
      code: "BVT_MONTHLY_GBP",
      description: "A monthly subscription plan billed in GBP.",
      features: AllFeatures,
      price: PRICE.BVT_MONTHLY_GBP,
      currency: "GBP",
      mode: "Monthly",
    },
    BVT_ANNUAL_HKD: {
      name: "Bevetu Annual Subscription (HKD)",
      code: "BVT_ANNUAL_HKD",
      description: "An annual subscription plan billed in HKD.",
      features: AllFeatures,
      price: PRICE.BVT_ANNUAL_HKD,
      currency: "HKD",
      mode: "Annual",
    },
    BVT_MONTHLY_HKD: {
      name: "Bevetu Monthly Subscription (HKD)",
      code: "BVT_MONTHLY_HKD",
      description: "A monthly subscription plan billed in HKD.",
      features: AllFeatures,
      price: PRICE.BVT_MONTHLY_HKD,
      currency: "HKD",
      mode: "Monthly",
    },
  };

  return products;
}
