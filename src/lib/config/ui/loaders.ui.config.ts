const AIR_PLANE_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/airplane_animation.json";
const CAMERA_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/camera_animation.json";
const COMPASS_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/compass_animation.json";
const LUGGAGE_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/luggage_animation.json";
const MAP_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/map_animation.json";
const MOUNTAIN_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/mountain_animation.json";
const PASSPORT_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/passport_animation.json";
const VAN_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/van_animation.json";
export const MAP_LOADING_ANIMATION =
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/animations/map_loading_animation.json";
const LOADERS = [
  AIR_PLANE_ANIMATION,
  CAMERA_ANIMATION,
  COMPASS_ANIMATION,
  LUGGAGE_ANIMATION,
  MAP_ANIMATION,
  MOUNTAIN_ANIMATION,
  PASSPORT_ANIMATION,
  VAN_ANIMATION,
];

const getRandomLoader = () =>
  LOADERS[Math.floor(Math.random() * LOADERS.length)];

export { LOADERS, getRandomLoader };
