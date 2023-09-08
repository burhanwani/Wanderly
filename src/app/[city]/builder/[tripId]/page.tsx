"use client";
import AuthChecker from "../../../../components/layout/auth";
import { Main } from "../../../../components/layout/main";
import { useParams, useRouter } from "next/navigation";
import MainFeaturePage from "../../../../components/page/feature-page";
import {
  useGetTripQuery,
  useLazyGetTripQuery,
} from "../../../../redux/services/trips.services";

export default function TripBuilder() {
  return (
    <AuthChecker>
      <MainFeaturePage />
    </AuthChecker>
  );
}
