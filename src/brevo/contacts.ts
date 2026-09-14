import axios from "axios";

export type BrevoContact = {
  id: number;
  email: string;
};

type BrevoContactsResponse = {
  contacts: BrevoContact[];
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const findBrevoContactInList = async (email: string, apiKey: string) => {
  const response = await axios.get<BrevoContactsResponse>("https://api.brevo.com/v3/contacts", {
    headers: { "api-key": apiKey },
    params: { limit: 1000, offset: 0 },
  });
  return response.data.contacts.find((contact) => contact.email.toLowerCase() === email.toLowerCase());
};

export async function getBrevoContactByEmail(email: string, attempts = 5): Promise<BrevoContact> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) throw new Error("BREVO_API_KEY is missing");

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await axios
        .get<BrevoContact>(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          headers: { "api-key": apiKey },
          params: { identifierType: "email_id" },
        })
        .then((response) => response.data);
    } catch (error) {
      const canRetry = axios.isAxiosError(error) && error.response?.status === 404 && attempt < attempts;
      if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;

      const listedContact = await findBrevoContactInList(email, apiKey);
      if (listedContact) return listedContact;
      if (!canRetry) throw error;
      await wait(attempt * 500);
    }
  }

  throw new Error("Brevo contact lookup exhausted all attempts");
}
