import axios from "axios";
import { Dayjs } from "dayjs";
import { MOCO_TOKEN } from "./token";
import { MocoUserPresence } from "./types/moco-types";

export async function removeUserPresences(user_id: string, from: Dayjs, to?: Dayjs) {
  const existingPresences = await axios.get<MocoUserPresence[]>(
    "https://newcubator.mocoapp.com/api/v1/users/presences",
    {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
      params: { from, to, user_id },
    },
  );

  console.log(
    `Found ${existingPresences.data.length} presences for user ${user_id} in the given time frame ${from.toISOString()} - ${to.toISOString()}. Deleting them now`,
  );

  for (const presence of existingPresences.data) {
    await axios.delete(`https://newcubator.mocoapp.com/api/v1/users/presences/${presence.id}`, {
      headers: {
        Authorization: "Token token=" + MOCO_TOKEN,
      },
    });
  }
}
