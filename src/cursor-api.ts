import * as https from "https";
import { CursorAuthCredentials, UsageSummaryResponse } from "./models";
import { getAuthCredentials } from "./stateStore";

const USAGE_SUMMARY_URL = "https://cursor.com/api/usage-summary";

/**
 * Fetches usage summary from the Cursor API.
 * Uses the WorkosCursorSessionToken cookie for authentication
 * @returns The parsed usage summary response.
 */
export async function fetchUsageSummary(): Promise<UsageSummaryResponse> {

  const credentials = getAuthCredentials();
  const cookie = buildAuthCookie(credentials);

  const options: https.RequestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `WorkosCursorSessionToken=${cookie}`,
      Origin: "https://cursor.com",
    },
  };

  return new Promise<UsageSummaryResponse>((resolve, reject) => {
    const req = https.request(USAGE_SUMMARY_URL, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data) as UsageSummaryResponse;
            resolve(parsed);
          } else {
            console.error(
              `[Cursor Usage Stats] HTTP ${res.statusCode}: ${data}`,
            );
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          console.error(
            `[Cursor Usage Stats] Failed to parse response: ${error}`,
          );
          reject(new Error(`Failed to parse response: ${error}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error(`[Cursor Usage Stats] Request failed: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

/**
 * Builds the cookie string required for Cursor API authentication.
 */
function buildAuthCookie(credentials: CursorAuthCredentials) {
  return `WorkosCursorSessionToken=${credentials.userId}::${credentials.accessToken}`;
}