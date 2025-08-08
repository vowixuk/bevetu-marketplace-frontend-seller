import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { dashboardRoutes, Dashboard } from "../modules/dashboard";
import { productRoutes } from "../modules/product";
import { orderRoutes } from "../modules/order/router";
import { settingsRoutes } from "../modules/setting";
import { shopSetupRoutes } from "../modules/shopSetup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
        index: true,
      },
      {
        path: "dashboard",
        children: dashboardRoutes,
      },
      {
        path: "products",
        children: productRoutes,
      },
      {
        path: "orders",
        children: orderRoutes,
      },
      {
        path: "settings",
        children: settingsRoutes,
      },
      {
        path: "shop-setup",
        children: shopSetupRoutes,
      },
    ],
  },
]);
export default router