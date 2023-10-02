"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import Autosuggest, {
  ChangeEvent,
  RenderSuggestionsContainerParams,
} from "react-autosuggest";
import { useRouter } from "next/navigation";
import { ROUTES_CONSTANTS } from "../../lib/constants/routes.constants";
import { cn } from "../../lib/utils/ui.utils";
import { useSession, signIn } from "next-auth/react";
import { AUTH_SIGN_OPTION } from "../../lib/constants/auth.constants";
import { useToast } from "./use-toast";
import { useLazyGetPredictionsQuery } from "../../redux/services/google.services";
import { selectTripsEntities } from "../../redux/features/days.slice";
import { useAppSelector } from "../../redux/hooks";
import { TypographyH4 } from "./typography";
import { GooglePlacesAutocompleteResponseSchemaType } from "../../lib/schema/prediction.schema";
import { isAdminUser } from "../../lib/config/app/app.config";
import { sendGAEvent } from "../../lib/config/google-analytics/google-analytics.config";
const AutocompleteInput = () => {
  const router = useRouter();
  const session = useSession();
  const tripEntities = useAppSelector(selectTripsEntities);
  const trips = useMemo(
    () => Object.values(tripEntities || {}),
    [tripEntities]
  );
  const [value, setValue] = useState<string>("");
  const [suggestionsList, setSuggestionsList] = useState<
    GooglePlacesAutocompleteResponseSchemaType["predictions"]
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [fetchPredictions] = useLazyGetPredictionsQuery();
  // const [fetchGenerateActivities] = useLazyGenerateActivitiesQuery();
  // Function to handle input value change
  const handleChange = useCallback(
    (event: React.FormEvent<HTMLElement>, { newValue }: ChangeEvent) => {
      setValue(() => newValue);
    },
    []
  );

  // Function to render suggestions
  const renderSuggestion = useCallback(
    (
      suggestion: GooglePlacesAutocompleteResponseSchemaType["predictions"][0]
    ) => {
      return <div className="cursor-pointer">{suggestion?.description}</div>;
    },
    []
  );

  // Function to get suggestions based on user input
  const getSuggestions = useCallback(
    async (value: string) => {
      // Simulate async API call
      const filteredSuggestions =
        (await fetchPredictions(value).unwrap()) || [];
      // Set suggestions list
      setSuggestionsList(() => filteredSuggestions);
    },
    [fetchPredictions]
  );

  // Function to handle suggestion selection
  const handleSuggestionSelected = useCallback(
    (
      event: React.FormEvent<HTMLInputElement>,
      {
        suggestion,
      }: {
        suggestion: GooglePlacesAutocompleteResponseSchemaType["predictions"][0];
      }
    ) => {
      if (session.status == "authenticated") {
        router.push(ROUTES_CONSTANTS.cityBuilder(suggestion.place_id));
        sendGAEvent(
          "Home_Place_Search",
          "Search for place",
          suggestion.description,
          session?.data?.user?.id
        );
      } else {
        sendGAEvent(
          "Home_Place_Search",
          "Search for place",
          suggestion.description
        );
        signIn(AUTH_SIGN_OPTION.DEFAULT, {
          redirect: true,
          callbackUrl: ROUTES_CONSTANTS.cityBuilder(suggestion.place_id),
        });
      }
    },
    [router, session?.data?.user?.id, session.status]
  );

  // Input properties for Autosuggest component
  const inputProps = {
    ref: inputRef,
    value,
    onChange: handleChange,
    placeholder: "I would love to go to...",
    className: "px-4 py-2 w-full rounded-md",
  };

  // Render suggestions container
  const renderSuggestionsContainer = ({
    containerProps,
    children,
  }: RenderSuggestionsContainerParams) => {
    const { ref, key, ...restContainerProps } = containerProps;
    const inputWidth = inputRef?.current ? inputRef?.current?.offsetWidth : 0;
    const containerStyle = {
      width: `${inputWidth}px`,
    };

    return (
      <div
        key={key}
        {...restContainerProps}
        ref={ref}
        style={containerStyle}
        className={cn(
          "absolute mt-1 bg-background rounded-b-md z-10 px-4 ",
          inputRef?.current?.value != "" && suggestionsList.length != 0
            ? "border shadow-lg"
            : ""
        )}
      >
        {children}
      </div>
    );
  };
  const onSuggestionsFetchRequested = useCallback(
    ({ value }: { value: string }) => getSuggestions(value),
    [getSuggestions]
  );
  const getSuggestionValue = useCallback(
    (
      suggestion: GooglePlacesAutocompleteResponseSchemaType["predictions"][0]
    ) => suggestion.description,
    []
  );
  const onSuggestionsClearRequested = useCallback(
    () => setSuggestionsList([]),
    []
  );

  if (
    session.status == "authenticated" &&
    trips.length > 2 &&
    !isAdminUser(session)
  ) {
    return <TypographyH4>Only 3 trips are allowed in beta</TypographyH4>;
  }
  return (
    <Autosuggest
      containerProps={{ className: "w-full" }}
      suggestions={suggestionsList}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={renderSuggestionsContainer}
      inputProps={inputProps}
      onSuggestionSelected={handleSuggestionSelected}
    />
  );
};

export default AutocompleteInput;
