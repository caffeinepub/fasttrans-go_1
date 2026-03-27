import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AuthPage from "./pages/AuthPage";
import BookRideScreen from "./pages/BookRideScreen";
import DriverDashboard from "./pages/DriverDashboard";
import DriverEnRoutePage from "./pages/DriverEnRoutePage";
import DriverRegistrationPage from "./pages/DriverRegistrationPage";
import HomeScreen from "./pages/HomeScreen";
import NotificationsPage from "./pages/NotificationsPage";
import PassengerDashboard from "./pages/PassengerDashboard";
import ProfilePage from "./pages/ProfilePage";
import SafetyPage from "./pages/SafetyPage";
import SettingsPage from "./pages/SettingsPage";
import TripHistoryPage from "./pages/TripHistoryPage";
import TripInProgressPage from "./pages/TripInProgressPage";
import TripRatingPage from "./pages/TripRatingPage";

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup =
    !!identity && !isLoading && isFetched && profile === null;

  return (
    <>
      <Outlet />
      <ProfileSetupModal open={showProfileSetup} />
      <Toaster richColors position="top-center" />
    </>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeScreen,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/book",
  component: BookRideScreen,
});

const passengerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/passenger",
  component: PassengerDashboard,
});

const driverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver",
  component: DriverDashboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: TripHistoryPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const safetyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/safety",
  component: SafetyPage,
});

const driverEnRouteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver-enroute",
  component: DriverEnRoutePage,
});

const driverRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver-register",
  component: DriverRegistrationPage,
});

const tripInProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trip-in-progress",
  component: TripInProgressPage,
});

const tripRatingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trip-rating",
  component: TripRatingPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  bookRoute,
  passengerRoute,
  driverRoute,
  profileRoute,
  historyRoute,
  notificationsRoute,
  settingsRoute,
  safetyRoute,
  driverEnRouteRoute,
  driverRegisterRoute,
  tripInProgressRoute,
  tripRatingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
