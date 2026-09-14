import axios from "axios";

export type BrevoContact = {
  id: number;
  email: string;
};

export async function getBrevoContactByEmail(email: string): Promise<BrevoContact> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY is missing");

  return axios
    .get<BrevoContact>(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: { "api-key": apiKey },
    })
    .then((response) => response.data);
}
