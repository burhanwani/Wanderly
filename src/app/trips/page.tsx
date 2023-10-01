"use client";
import AuthChecker from "../../components/layout/auth";
import MyTripsPage from "../../components/page/my-trips";

function MyTrips() {
  return (
    <AuthChecker>
      <MyTripsPage />
    </AuthChecker>
  );
}

export default MyTrips;
