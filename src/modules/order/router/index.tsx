import { ViewOrder,ViewAllOrders } from "../views";

export const orderRoutes = [
    { path: "", element: <ViewAllOrders />, index: true },
    { path: "", element: <ViewOrder /> }
];

