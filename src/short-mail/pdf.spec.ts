import { renderShortMailPdf } from "./pdf";
import { toMatchFile } from "jest-file-snapshot";
import dayjs from "dayjs";

expect.extend({ toMatchFile });

test("render pdf", async () => {
  let pdf = renderShortMailPdf({
    sender: "Max Mustermann",
    senderAdressHeader: "newcubator GmbH | Westenhellweg 85-89 | 44137 Dortmund",
    senderAdressFooter: "\nWestenhellweg 85-89\n44137 Dortmund\n+49 (0) 231 58687380\n",
    recipient: {
      salutation: "geehrter Herr",
      firstname: "Bill",
      lastname: "Gates",
      address: "Suchallee 42\n54321 Suchstadt",
    },
    date: dayjs(),
    text: "Testnachricht an Bill",
  });

  // Remove unique id inside the pdf
  let content = pdf.toString("binary");
  content = content.replace(/^\s*\/ID\s.*/m, "");
  pdf = Buffer.from(content, "binary");

  expect(pdf).toMatchFile();
});
