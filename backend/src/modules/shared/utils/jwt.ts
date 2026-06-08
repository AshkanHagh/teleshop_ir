import { verify } from "hono/jwt";
import ErrorFactory from "./customErrors";

type JwtError = {
  name:
    | "JwtTokenInvalid"
    | "JwtTokenNotBefore"
    | "JwtTokenExpired"
    | "JwtTokenSignatureMismatched";
};
type JwtErrorMap = Record<
  JwtError["name"],
  { message: string; statusCode: number }
>;

export const verifyJwtToken = async <T>(
  token: string,
  secret: string,
): Promise<T> => {
  try {
    return (await verify(token, secret)) as T;
  } catch (err: unknown) {
    const jwtErrorMap: JwtErrorMap = {
      JwtTokenInvalid: { message: "Invalid Token.", statusCode: 401 },
      JwtTokenNotBefore: {
        message: "Access Token has been used before its valid date.",
        statusCode: 401,
      },
      JwtTokenExpired: {
        message: "Access Token has expired.",
        statusCode: 401,
      },
      JwtTokenSignatureMismatched: {
        message: "Signature mismatch in the access token.",
        statusCode: 401,
      },
    };

    const error = jwtErrorMap[(err as JwtError).name];
    throw ErrorFactory.AccessTokenInvalidError(error.message);
  }
};
