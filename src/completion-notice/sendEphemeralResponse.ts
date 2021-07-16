import axios from "axios";

export const sendEphemeralResponse = (url: string, data: object) => {
  axios.post(url, data);
};
