import { Dayjs } from "dayjs";
import "dayjs/locale/de";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { base64Hannover } from "./templates/hannover";
import { base64Dortmund } from "./templates/dortmund";

export async function renderShortMailPdf(content: PdfContent) {
  const { sender, location, recipient, date, text } = content;

  // pdf-lib's standard fonts use WinAnsi and cannot encode decomposed characters
  // such as "a" followed by a combining diaeresis. Normalize all dynamic text
  // before passing it to drawText so German umlauts are represented as one glyph.
  const normalizedSender = sender.normalize("NFC");
  const normalizedText = text.normalize("NFC");
  const normalizedFirstname = recipient.firstname.normalize("NFC");
  const normalizedLastname = recipient.lastname.normalize("NFC");
  const normalizedSalutation = recipient.salutation.normalize("NFC");
  const normalizedAddress = recipient.address.normalize("NFC");

  const dortmundAddressHeader = "Newcubator GmbH | Ruhrallee 9 | 44139 Dortmund";

  const hannoverAddressHeader = "Newcubator GmbH | Bödekerstraße 22 | 30161 Hannover";
  const senderAddressHeader = location === "D" ? dortmundAddressHeader : hannoverAddressHeader;
  const pdfDoc = await PDFDocument.load(location === "D" ? base64Dortmund : base64Hannover);

  const pages = pdfDoc.getPages();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const firstPage = pages[0];
  const { height } = firstPage.getSize();
  pages[0].drawText(`${senderAddressHeader}`, {
    x: 68,
    y: height - 140,
    size: 7,
  });
  pages[0].drawText(
    normalizedAddress
      .replace(`${normalizedFirstname} ${normalizedLastname}`, "")
      .replace("\n", `\n${normalizedFirstname} ${normalizedLastname}\n`),
    {
      x: 68,
      y: height - 160,
      size: 10,
      lineHeight: 15,
      maxWidth: 200,
    },
  );
  pages[0].drawText(date.locale("de").format("D. MMMM YYYY"), {
    x: 465,
    y: height - 220,
    size: 10,
  });
  pages[0].drawText(`${normalizedSalutation},`, {
    x: 68,
    y: height - 300,
    size: 10,
    font: helveticaFont,
  });
  pages[0].drawText(`${normalizedText}\n \nmit freundlichen Grüßen\nNewcubator GmbH\n \n${normalizedSender}`, {
    x: 68,
    y: height - 325,
    size: 10,
    maxWidth: 460,
    font: helveticaFont,
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
