const requiredNumber =
  (parser: (fromEnv: string) => number, failedParseAsText: string) => (envVariable: `REACT_APP_${string}`) => {
    const fromEnv = process.env[envVariable];
    if (fromEnv === undefined) {
      throw new Error(`Required environment variable ${envVariable} was missing at compilation time.`);
    } else {
      const parsed = parser(fromEnv);
      if (isNaN(parsed)) {
        throw new Error(
          `Value '${fromEnv}' for environemnt variable ${envVariable} could not be parsed as ${failedParseAsText}.`,
        );
      } else {
        return parsed;
      }
    }
  };
const requiredInt = requiredNumber((fromEnv) => parseInt(fromEnv, 10), "an integer");
const requiredFloat = requiredNumber(parseFloat, "a number");

export const BEST_KMEANS_OF_N = requiredInt("REACT_APP_BEST_KMEANS_OF_N");
export const SAMPLES_PER_BOX = requiredInt("REACT_APP_SAMPLES_PER_BOX");
export const PIXEL_LOCATION_EXPONENT = requiredFloat("REACT_APP_PIXEL_LOCATION_EXPONENT");
export const COLOR_ASSIGNMENT_EXPONENT = requiredFloat("REACT_APP_COLOR_ASSIGNMENT_EXPONENT");
