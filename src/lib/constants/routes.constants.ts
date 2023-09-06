const ROUTES_CONSTANTS = {
  signIn: "/api/v1/auth/signin",
  signOut: "/api/v1/auth/signout",
  error: "/api/v1/auth/error",
  verifyRequest: "/auth/verify-request",
  home: "/",
  signOutPage: "/signout",
  create: "/create/",
  trips: "/trips",
  cityBuilder: (placeId: string) => `/${placeId}/builder`,
  tripBuilder: (placeId: string, tripId: string) =>
    `/${placeId}/builder/${tripId}`,
  rateLimit: "/429",
};

const API_ROUTES_CONSTANTS = {
  updateActivity: "/api/v1/day/update-activity",
  myTrips: "/api/v1/trip/all",
  createTrip: "/api/v1/trip/create",
  predictions: "/api/v1/google/predictions",
  place: "/api/v1/google/place",
  getTripById: "/api/v1/trip/id",
};

export { API_ROUTES_CONSTANTS, ROUTES_CONSTANTS };
