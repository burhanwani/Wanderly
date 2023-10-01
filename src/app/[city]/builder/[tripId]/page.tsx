"use client";
import AuthChecker from "../../../../components/layout/auth";
import MainFeaturePage from "../../../../components/page/feature-page";

export default function TripBuilder() {
  return (
    <AuthChecker>
      <MainFeaturePage />
    </AuthChecker>
  );
}
