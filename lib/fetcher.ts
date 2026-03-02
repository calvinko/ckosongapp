/**
 * Fetcher for useSWR
 *
 * @param url
 */
export const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Fetcher with 60 second max age (100 second stale while revalidate)
 *
 * @param url url
 * @returns  Json response
 */
export const fetcherWithMaxAge = (url: string) =>
  fetch(url, {
    headers: {
      "Cache-Control":
        "public, max-age=60, stale-while-revalidate=100, stale-if-error=600",
    },
  }).then((r) => r.json());

/**
 * Fetcher with 10 minute max age (20 minte stale while revalidate)
 *
 * @param url url
 * @returns  Json response
 */
export const fetcherLongMaxAge = (url: string) =>
  fetch(url, {
    headers: {
      "Cache-Control":
        "public, max-age=600, stale-while-revalidate=1200, stale-if-error=3600",
    },
  }).then((r) => r.json());

/**
 * Fetcher with 10 second max age (30 second stale while revalidate)
 *
 * @param url url
 * @returns  Json response
 */
export const fetcherWithShortMaxAge = (url: string) =>
  fetch(url, {
    headers: {
      "Cache-Control":
        "public, max-age=10, stale-while-revalidate=30, stale-if-error=60",
    },
  }).then((r) => r.json());

/**
 * Fetcher to send POST requests for useSWR
 *
 * @param url
 */
export const fetcherPOST = (url: string) =>
  fetch(url, { method: "POST" }).then((r) => r.json());

/**
 * Wrapper around fetch with timeout. fetch doesn't have a timeout besides the one set by the browser (in chrome it's 300 seconds)
 * so this timeouts in 8 seconds. https://dmitripavlutin.com/timeout-fetch-request/s
 *
 * @param resource fetch resource to put in fetch's first argument
 * @param options  the options you put in fetch
 * @returns
 */
export async function fetchWithTimeout(
  resource,
  options: any = {}
): Promise<Response> {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

/**
 * Default swr options - where we don't revalidate on certain scenarios so we reduce unnecessary the async fetching, opting for the user to refresh for refreshed data
 * https://swr.vercel.app/docs/options
 */
export const DEFAULT_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export default fetcher;
