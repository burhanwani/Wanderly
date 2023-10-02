type DifferenceParams = { [s: string]: any };

export function getDifference(
  currentData: DifferenceParams,
  newData: DifferenceParams,
) {
  const updates = {} as DifferenceParams;
  for (const [key, value] of Object.entries(newData)) {
    if (JSON.stringify(currentData[key]) !== JSON.stringify(value)) {
      updates[key] = value;
    }
  }
  return updates;
}
