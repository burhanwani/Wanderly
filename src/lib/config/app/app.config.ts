const EMAIL_IDS = {
  MANOJ: "manojcchoudhary@gmail.com",
  BURHAN: "burhan.ayub@gmail.com",
  AAMIR: "shek.m.aamir@gmail.com",
  HIMANIL: "himanilgole@gmail.com",
};

export const IS_ADMIN = Object.values(EMAIL_IDS);

export const BETA_LIMIT = 2;

export const isBetaLimitReached = (tripsCount = 0) => tripsCount >= BETA_LIMIT;

export const isAdminUser = (email: string) => IS_ADMIN.includes(email);

export enum WanderlyVersion {
  "V1" = "V1",
  "V2" = "V2",
}
