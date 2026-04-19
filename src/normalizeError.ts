import { type FetchError } from "./interfaces.js";

/**
 * Normalizes an unknown thrown value into a `FetchError`-shaped object.
 * Handles `Error` instances, error-like objects, and primitive values.
 * @example
 * normalizeError(new Error("oops"))                                      // { status: 500, statusText: "oops", response: "<stack>" }
 * normalizeError({ status: 404, statusText: "Not Found", response: "" }) // { status: 404, statusText: "Not Found", response: "" }
 * normalizeError({ status: 403 })                                        // { status: 403, statusText: "", response: "" }
 * normalizeError("something went wrong")                                 // { status: 500, statusText: "something went wrong", response: "" }
 * normalizeError(null)                                                   // { status: 500, statusText: "null", response: "" }
 */
function normalizeError<E = FetchError>(err: unknown): E {
  if (err instanceof Error) {
    return {
      status: 500,
      statusText: err.message,
      response: err.stack ?? "",
    } as E;
  }

  if (typeof err === "object" && err !== null) {
    const e = err as Partial<FetchError>;
    return {
      status: e.status ?? 500,
      statusText: e.statusText ?? "",
      response: e.response ?? "",
    } as E;
  }

  return {
    status: 500,
    statusText: String(err),
    response: "",
  } as E;
}

export default normalizeError;
