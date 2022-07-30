import "dayjs/locale/de";
import { base64 } from "./logo";
import { Dayjs } from "dayjs";
import { jsPDF } from "jspdf";

export function renderShortMailPdf(content: PdfContent) {
  const { sender, senderAdressHeader, senderAdressFooter, recipient, date, text } = content;

  const doc = new jsPDF({
    unit: "pt",
  });

  doc
    .setCreationDate(new Date("1995-12-17T03:24:00"))
    .addImage(base64, 385, 45, 140, 28)
    .setFontSize(7)
    .text(`${senderAdressHeader}`, 68, 130)
    .setFontSize(10)
    .text(
      recipient.address
        .replace(`${recipient.firstname} ${recipient.lastname}`, "")
        .replace("\n", `\n${recipient.firstname} ${recipient.lastname}\n`),
      68,
      160
    )
    .text(date.locale("de").format("D. MMMM YYYY"), 465, 220)
    .setFont("helvetica", "normal")
    .text(`Sehr ${recipient.salutation} ${recipient.lastname},`, 68, 300)
    .text(`${text}`, 68, 325, {
      maxWidth: 460,
    })
    .text(`mit freundlichen Grüßen\n\nnewcubator GmbH\n\n\n${sender}`, 68, 400)
    .setFontSize(8)
    .text(`newcubator GmbH${senderAdressFooter}info@newcubator.com\nhttps://newcubator.com`, 68, 745)
    .text("Geschäftsführer: Jörg Herbst\nSitz der Gesellschaft: Hannover\nAmtsgericht Hannover HRB 221930", 525, 745, {
      align: "right",
    });

  return Buffer.from(doc.output("arraybuffer"));
}

export interface PdfContent {
  sender: string;
  senderAdressFooter: string;
  senderAdressHeader: string;
  recipient: {
    salutation: String;
    firstname: String;
    lastname: String;
    address: String;
  };
  date: Dayjs;
  text: string;
}
