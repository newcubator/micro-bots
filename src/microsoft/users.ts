import axios from "axios";
import { getAzureAccessToken } from "./token";
import { MicrosoftUsersType } from "./types/microsoft-types";

export async function getUsers(): Promise<MicrosoftUsersType> {
  const azureAccessToken = await getAzureAccessToken();

  return axios
    .get(`https://graph.microsoft.com/v1.0/users/`, {
      headers: { Authorization: `Bearer ${azureAccessToken.access_token}` },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}
