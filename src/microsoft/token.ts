import axios from "axios";
import { AzureAccessType } from "./types/microsoft-types";
const qs = require("qs");

const MICROSOFT_TOKEN = process.env.MICROSOFT_TOKEN;
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${MICROSOFT_TOKEN}/oauth2/v2.0/token`;
const postData = {
  client_id: MICROSOFT_CLIENT_ID,
  client_secret: MICROSOFT_CLIENT_SECRET,
  scope: "https://graph.microsoft.com/.default",
  grant_type: "client_credentials",
};

export function getAzureAccessToken(): Promise<AzureAccessType> {
  return axios
    .post(TOKEN_ENDPOINT, qs.stringify(postData), {
      headers: { "Content-Type": `application/x-www-form-urlencoded` },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}
