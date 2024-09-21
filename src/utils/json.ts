export const stringToJson = <T>(jsonString: string): T | undefined => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (err: unknown) {
    console.error(err);
  }
};
