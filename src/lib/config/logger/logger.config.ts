export enum WanderlyLoggers {
  "info" = "info",
  "debug" = "debug",
  "cacheDebug" = "cacheDebug",
  "devDebug" = "devDebug",
  "error" = "error",
}

const shouldLog = (loggerType: WanderlyLoggers) => {
  return process.env
    .NEXT_PUBLIC_WANDERLY_LOGGER_TYPES!?.split(",")
    .includes(loggerType);
};

const generateMessage = (
  action: string,
  userId: string = "Unauthenticated",
) => {
  return `action: ${action} by user id: ${userId}`;
};
export const logInfo = (action: string, userId: string) => {
  if (shouldLog(WanderlyLoggers.info))
    console.info(generateMessage(action, userId));
};

export const logDebug = (action: string, userId: string) => {
  if (shouldLog(WanderlyLoggers.debug))
    console.debug(generateMessage(action, userId));
};

export const logCacheDebug = (action: string, key: string, data: any) => {
  if (shouldLog(WanderlyLoggers.cacheDebug))
    console.debug(
      `Cache Log | action : ${action} | key: ${key} | data : `,
      data,
    );
};

export const logDevDebug = (action: string, data: any) => {
  if (shouldLog(WanderlyLoggers.devDebug))
    console.debug(`Dev Log | action : ${action} |  data : `, data);
};

export const logError = (
  action: string,
  userId: string = "Unauthenticated",
  error?: unknown,
) => {
  if (shouldLog(WanderlyLoggers.error))
    console.error(generateMessage(action, userId), error);
};
