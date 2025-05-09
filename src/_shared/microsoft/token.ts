import axios from "axios";
import { stringify } from "node:querystring";

// Cache
let cachedAccessToken: string = undefined;
let cachedAccessTokenExpiration: number = undefined;

export function getAzureAccessToken(): Promise<string> {
  const MICROSOFT_TOKEN = process.env.MICROSOFT_TOKEN;
  if (!MICROSOFT_TOKEN) {
    return Promise.reject(new Error("Microsoft graph api token configuration missing"));
  }

  const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  if (!MICROSOFT_CLIENT_ID) {
    return Promise.reject(new Error("Microsoft graph api client id configuration missing"));
  }

  const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
  if (!MICROSOFT_CLIENT_SECRET) {
    return Promise.reject(new Error("Microsoft graph api client secret configuration missing"));
  }

  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiration) {
    return Promise.resolve(cachedAccessToken);
  }

  console.info("Requesting microsoft graph api access token.");
  return axios
    .post(
      `https://login.microsoftonline.com/${MICROSOFT_TOKEN}/oauth2/v2.0/token`,
      stringify({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
      {
        headers: { "Content-Type": `application/x-www-form-urlencoded` },
      },
    )
    .then((response) => {
      // update cache
      cachedAccessToken = response.data.access_token;
      cachedAccessTokenExpiration = Date.now() + toMilliSeconds(response.data.expires_in - 20);

      return cachedAccessToken;
    })
    .catch((error) => {
      console.error("Error while calling microsoft graph api to get access token!");
      throw error;
    });
}

function toMilliSeconds(timeInSeconds: number): number {
  return timeInSeconds * 1000;
}
