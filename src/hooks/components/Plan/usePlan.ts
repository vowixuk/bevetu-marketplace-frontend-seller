import { useState, useEffect } from "react";
import {
  useViewAllProducts,
  useViewUserRecentSubscription,
} from "hooks/api/queries";
import { Subscription } from "@services/api/types/main-services.types";
import { priceFormatter } from "utils/currencySymbol";
import useBrowserWidth from "hooks/components/BrowserWidth/useBrowserWidth";


const usePlan = () => {
  /**
   * All the below store the data of user's current subscription data
   */
  const [petAccountNo, setPetAccountNo] = useState<number>(0);
  const [nextBillDate, setNextBillDate] = useState<string>("");
  const [nextBillAmount, setNextBillAmount] = useState<string>("0");
  const [recentSubscription, setRecentSubscription] =
    useState<Subscription.ISubscription | null>(null);
  const [currentStatus, setCurrentStatus] =
    useState<Subscription.SubscriptionStatusType>("ACTIVE");

  const [billingCycle, setBillingCycle] = useState<"Yearly" | "Monthly">(
    "Yearly"
  );
  const [currencyChosen, setCurrencyChosen] = useState<"GBP" | "HKD" | "USD">(
    "HKD"
  );

  /**
   *  store weather user's current plan is free plan or not
   */
  const [isCurrentPlanFreePlan, setIsCurrentPlanFreePlan] =
    useState<boolean>(false);

  /**
   * Query to fetch all the product data
   */
  const { data: allProductsData } = useViewAllProducts();

  /**
   * Query to fetch the user's current subscription data
   */
  const { data: recentSubscriptionData } = useViewUserRecentSubscription();

  const [currentProductData, setCurrentProductData] = useState<Subscription.IProduct>()
  /**
   * Get browser's width
   */
  const { browserWidth } = useBrowserWidth();

  /**
   * indicate if some action is loaidng
   */
  const [someActionIsLoading, setSomeActionIsloading] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      recentSubscriptionData &&
      typeof recentSubscriptionData != "string" &&
      allProductsData
    ) {
      /* Get user's current's subscription status data */
      const { status, seatNo, productCode, nextPaymentDate } =
        recentSubscriptionData.data as Subscription.ISubscription;

      /*  Get user's current's subscription product details */     
      const _currentProductData = Object.values(allProductsData)
        .flat()
        .find((product) => product.code === productCode)!;

      const { mode, price, currency } = _currentProductData;
      setBillingCycle(
        productCode === "BVT_FREE_TRIAL"
          ? "Yearly"
          : mode === "Annual"
          ? "Yearly"
          : "Monthly"
      );
      setCurrencyChosen(currency);
      setRecentSubscription(recentSubscriptionData.data);
      setCurrentProductData(_currentProductData);
      setCurrentStatus(status);
      setPetAccountNo(seatNo);
      setNextBillDate(new Date(nextPaymentDate).toDateString());
      setNextBillAmount(priceFormatter(seatNo * price, currency));
      setIsCurrentPlanFreePlan(productCode === "BVT_FREE_TRIAL");
    }
  }, [allProductsData, recentSubscriptionData]);



  return {
    petAccountNo,
    setPetAccountNo,
    nextBillDate,
    setNextBillDate,
    nextBillAmount,
    setNextBillAmount,
    recentSubscription,
    setRecentSubscription,
    currentStatus,
    setCurrentStatus,
    billingCycle,
    setBillingCycle,
    currencyChosen,
    setCurrencyChosen,
    isCurrentPlanFreePlan,
    setIsCurrentPlanFreePlan,
    someActionIsLoading,
    setSomeActionIsloading,
    browserWidth,
    allProductsData,
    currentProductData,
    setCurrentProductData,
  };
};


export default usePlan