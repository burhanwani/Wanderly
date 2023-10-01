import ReactGA from "react-ga4";

export const initGA = (userId: string | undefined) => {
  console.log(
    "process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  );
  ReactGA.initialize(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!, {
    testMode: true,
    gaOptions: {
      userId: userId,
    },
  });
};

export const sendGAEvent = (
  category: string,
  action: string,
  label?: string | undefined,
  value?: number | undefined
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname,
    title: document.title,
  });
};
