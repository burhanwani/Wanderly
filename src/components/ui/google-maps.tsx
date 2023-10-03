import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleMap,
  GoogleMapProps,
  MarkerF,
  MarkerProps,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils/ui.utils";
import { useAppSelector } from "../../redux/hooks";
import { Inter } from "next/font/google";
import { sendGAEvent } from "../../lib/config/google-analytics/google-analytics.config";
import { ActivityModalSchemaTypeV2 } from "../../lib/schema/day.v2.schema";

interface IConciergeGoogleMap {
  initialPosition: {
    lat: number;
    lng: number;
  };
  className?: string;
  currentDay: string;
  setActivity: Dispatch<SetStateAction<ActivityModalSchemaTypeV2 | null>>;
}
const inter = Inter({ subsets: ["latin"] });
const googleMapsDark: GoogleMapProps["options"] = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }],
    },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
  mapTypeControl: false,
  streetViewControl: false,
};

const googleMapsLight: GoogleMapProps["options"] = {
  mapTypeControl: false,
  streetViewControl: false,
  styles: [
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#c9edc5",
        },
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#f4f3f0",
        },
      ],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry.fill",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "landscape.natural.terrain",
      elementType: "geometry.fill",
      stylers: [
        {
          visibility: "on",
        },
        {
          color: "#bcdfb8",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#c8eec4",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#c9edc5",
        },
      ],
    },
    {
      featureType: "poi.sports_complex",
      elementType: "geometry",
      stylers: [
        {
          color: "#c8eec4",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          lightness: 100,
        },
        {
          visibility: "simplified",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [
        {
          visibility: "simplified",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text",
      stylers: [
        {
          weight: "1",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [
        {
          lightness: "0",
        },
        {
          color: "#ffe492",
        },
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#ffffff",
        },
        {
          weight: "2.53",
        },
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.stroke",
      stylers: [
        {
          visibility: "on",
        },
        {
          color: "#ffffff",
        },
        {
          weight: "0.50",
        },
      ],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [
        {
          visibility: "on",
        },
        {
          lightness: 700,
        },
      ],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [
        {
          color: "#7dcdcd",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#abd9ee",
        },
      ],
    },
  ],
};

function ConciergeGoogleMap({
  initialPosition,
  className = "",
  currentDay = "",
  setActivity,
}: IConciergeGoogleMap) {
  const { theme = "light" } = useTheme();
  const [position, setPosition] = useState<
    IConciergeGoogleMap["initialPosition"]
  >({ lat: 0, lng: 0 });
  const day = useAppSelector((state) => state.days.entities[currentDay]);
  const placeDetails = useAppSelector((state) => state.google.places.entities);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!,
  });

  const activityWithGoogleMeta = useMemo(() => {
    return (day?.activities || []).map((activity) => {
      const location =
        placeDetails[activity?.placeId!]?.result.geometry.location;

      return { activity, location, theme };
    });
  }, [day?.activities, placeDetails, theme]);
  useEffect(() => {
    setPosition(() => initialPosition);
  }, [initialPosition]);

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(
    function callback(map: google.maps.Map) {
      // This is just an example of getting and using the map instance!!! don't just blindly copy!
      const bounds = new google.maps.LatLngBounds();
      activityWithGoogleMeta?.forEach((activity) => {
        bounds.extend(
          new google.maps.LatLng(
            activity.location?.lat!,
            activity.location?.lng!
          )
        );
      });
      map.fitBounds(bounds);
      map.setStreetView(null);
      setMap(map);
      sendGAEvent("Google_Map_Loaded", "Google Maps Loaded");
    },
    [activityWithGoogleMeta]
  );

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const getPositionForMarker = useCallback(
    (activity: (typeof activityWithGoogleMeta)[0]) => {
      return {
        lat: activity?.location?.lat!,
        lng: activity?.location?.lng!,
      };
    },
    []
  );

  const getLabelForMarker = useCallback(
    (activity: (typeof activityWithGoogleMeta)[0]) => {
      return {
        text: (activity?.activity?.name! as string) || "",
        className: cn(
          "bg-[#EAF5FC]/70",
          inter.className,
          `p-2 font-semibold border rounded-md mb-8`
        ),
      } as MarkerProps["label"];
    },
    []
  );

  return isLoaded ? (
    <GoogleMap
      mapContainerClassName={cn("min-h-[80vh] ", className)}
      center={position}
      zoom={11}
      onLoad={onLoad}
      options={theme == "dark" ? googleMapsDark : googleMapsLight}
      onUnmount={onUnmount}
      clickableIcons={false}
    >
      {activityWithGoogleMeta?.map((activity) => {
        const position = getPositionForMarker(activity);
        const label = getLabelForMarker(activity);
        return (
          <MarkerF
            position={position}
            key={activity?.activity?.placeId}
            label={label}
            onClick={() => setActivity(activity?.activity)}
          />
        );
      })}
    </GoogleMap>
  ) : (
    <></>
  );
}
ConciergeGoogleMap.displayName = "ConciergeGoogleMap";

// export default ConciergeGoogleMap;
export default React.memo(ConciergeGoogleMap);
