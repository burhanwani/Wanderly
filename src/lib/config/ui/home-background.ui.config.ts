const BACKGROUNDS = [
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/1.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/2.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/3.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/4.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/5.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/6.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/7.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/8.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/9.jpg",
  "https://storage.googleapis.com/concierge-f18d2.appspot.com/home-page-background/10.jpg",
];

const getRandomBackground = () =>
  BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];

export { BACKGROUNDS, getRandomBackground };
