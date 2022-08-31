import { Dayjs } from "dayjs";
import "dayjs/locale/de";
import { PDFDocument } from "pdf-lib";
import { base64 } from "./templates/hannover";

export async function renderShortMailPdf(content: PdfContent) {
  const { sender, location, recipient, date, text } = content;

  const dortmundAddressHeader = "newcubator GmbH | Westenhellweg 85-89 | 44137 Dortmund";
  const hannoverAddressHeader = "newcubator GmbH | Bödekerstraße 22 | 30161 Hannover";
  const senderAddressHeader = location === "D" ? dortmundAddressHeader : hannoverAddressHeader;
  const pdfDoc = await PDFDocument.load(base64);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  pages[0].drawText(`${senderAddressHeader}`, {
    x: 68,
    y: height - 140,
    size: 7,
  });
  pages[0].drawText(
    recipient.address
      .replace(`${recipient.firstname} ${recipient.lastname}`, "")
      .replace("\n", `\n${recipient.firstname} ${recipient.lastname}\n`),
    {
      x: 68,
      y: height - 160,
      size: 10,
      lineHeight: 15,
      maxWidth: 200,
    }
  );
  pages[0].drawText(date.locale("de").format("D. MMMM YYYY"), {
    x: 465,
    y: height - 220,
    size: 10,
  });
  pages[0].drawText(`Sehr ${recipient.salutation} ${recipient.lastname},`, {
    x: 68,
    y: height - 300,
    size: 10,
  });
  pages[0].drawText(`${text}\n \nmit freundlichen Grüßen\nnewcubator GmbH\n \n${sender}`, {
    x: 68,
    y: height - 325,
    size: 10,
    maxWidth: 460,
  });

  const pdfBytes = pdfDoc.save();

  return Buffer.from(await pdfBytes);
}

export interface PdfContent {
  sender: string;
  location: string;
  recipient: {
    salutation: string;
    firstname: string;
    lastname: string;
    address: string;
  };
  date: Dayjs;
  text: string;
}
