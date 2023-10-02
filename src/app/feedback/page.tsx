"use client"; // NextJS 13 requires this. Remove if you are using NextJS 12 or lower
import { useEffect } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import AuthChecker from "../../components/layout/auth";
import { Card } from "../../components/ui/card";
import Iframe from "react-iframe";

const FeatureBaseComponent = () => {
  return (
    <Card className="w-screen h-screen">
      <Iframe
        url="https://wanderly.featurebase.app/"
        allowFullScreen={true}
        id=""
        height="100%"
        width="100%"
        className=""
        display="block"
        position="relative"
      />
    </Card>
  );
};

export default FeatureBaseComponent;
