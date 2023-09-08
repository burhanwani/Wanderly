"use client";
import AuthChecker from "../../components/layout/auth";
import MyTripsPage from "../../components/page/my-trips";
import { useAppSelector } from "../../redux/hooks";

function MyTrips() {
  return (
    <AuthChecker>
      <MyTripsPage />
    </AuthChecker>
  );
}

export default MyTrips;
