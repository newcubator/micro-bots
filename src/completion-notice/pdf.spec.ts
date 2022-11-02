import { renderCompletionNoticePdf } from "./pdf";
import { toMatchFile } from "jest-file-snapshot";
import dayjs from "dayjs";
import { join } from "path";

expect.extend({ toMatchFile });

test("render pdf", async () => {
  let pdf = renderCompletionNoticePdf({
    project: {
      name: "Mars Cultivation Season Manager",
      orderNumber: "123456789",
    },
    recipient: {
      salutation: "geehrter Herr",
      firstname: "Elon",
      lastname: "Musk",
      address: `\n1 Rocket Road\nHawthorne, CA 90250\nUnited States\n`,
    },
    date: dayjs("2022-01-02"),
  });

  // Remove unique id inside the pdf
  let content = pdf.toString("binary");
  content = content.replace(/^\s*\/ID\s.*/m, "");
  pdf = Buffer.from(content, "binary");

  expect(pdf).toMatchFile(join(__dirname, "/__file_snapshots__", "render-pdf.pdf"));
});
