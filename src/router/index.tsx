import { Navigate, createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import RouteError from "@/components/layout/RouteError";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { routes } from "./routes";

export const router = createBrowserRouter([
  // Public routes
  ...routes
    .filter((r) => r.path === "/login")
    .map((r) => ({
      path: r.path,
      element: <r.component />,
      errorElement: <RouteError />,
    })),

  // Protected app shell
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        errorElement: <RouteError />,
        children: [
          ...routes
            .filter((r) => r.path !== "/login")
            .map((r) => ({
              path: r.path,
              element: <r.component />,
            })),
          {
            path: "*",
            element: (
              <Navigate
                to={routes.find((r) => r.path !== "/login")?.path ?? "/"}
                replace
              />
            ),
          },
        ],
      },
    ],
  },
]);

export { routes, navRoutes, findRoute } from "./routes";
export type { AppRoute } from "./routes";
