import { Md5 } from "ts-md5";

export async function convertPdfToBase64(pdf) {
  return Buffer.from(pdf).toString("base64");
}
export async function getMd5Hash(base64) {
  return Md5.hashStr(base64);
}
