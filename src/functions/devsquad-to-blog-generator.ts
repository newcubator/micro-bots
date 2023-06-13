import axios from "axios";

export const handler = async () => {
  const response = await axios.get(`https://newcubator.com/api/devsquad-ai?secret=${process.env.DEVSQUAD_AI_SECRET}`);
  console.info("Response from Devsquad AI", response.data);
};
