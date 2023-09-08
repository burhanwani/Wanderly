export const BETA_LIMIT_EMAIL_WHITE_LIST = [
  "manojcchoudhary@gmail.com",
  "burhan.ayub@gmail.com",
];

export const BETA_LIMIT = 2;

export const isBetaLimitReached = (tripsCount = 0) => tripsCount >= BETA_LIMIT;
