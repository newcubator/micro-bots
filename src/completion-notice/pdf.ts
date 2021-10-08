import { jsPDF } from "jspdf";
import { Dayjs } from "dayjs";
import { base64 } from "./logo";

export function renderCompletionNoticePdf(content: PdfContent) {
  const { project, recipient, date } = content;

  const doc = new jsPDF({
    unit: "pt",
  });

  doc
    .setCreationDate(new Date("1995-12-17T03:24:00"))
    .addImage(base64, 385, 45, 140, 28)
    .setFontSize(7)
    .text("newcubator GmbH | Bödekerstraße 22 | 30161 Hannover", 68, 130)
    .setFontSize(10)
    .text(recipient.address.replace("\n", `\n${recipient.firstname} ${recipient.lastname}\n`), 68, 160)
    .text(date.locale("de").format("D. MMMM YYYY"), 465, 220)
    .setFont("helvetica", "bold")
    .text("Fertigstellungsanzeige", 68, 275)
    .setFont("helvetica", "normal")
    .text(`Sehr ${recipient.salutation} ${recipient.lastname},`, 68, 300)
    .text(
      `hiermit zeigen wir Ihnen an, dass wir alle von uns zu erbringenden Leistungen im Projekt ${project.name} mit der Auftragsnummer ${project.orderNumber} zu erbringenden Leistungen erbracht haben.`,
      68,
      325,
      {
        maxWidth: 460,
      }
    )
    .text("Wir bedanken uns für die gute Zusammenarbeit und verbleiben", 68, 360)
    .text("mit freundlichen Grüßen\n\nnewcubator GmbH\n\n\nJörg Herbst", 68, 400)
    .setFontSize(8)
    .text(
      "newcubator GmbH\nBödekerstraße 22\n\n30161 Hannover\n+49 (0) 511-95731300\ninfo@newcubator.com\nhttps://newcubator.com",
      68,
      745
    )
    .text("Geschäftsführer: Jörg Herbst\nSitz der Gesellschaft: Hannover\nAmtsgericht Hannover HRB 221930", 525, 745, {
      align: "right",
    });

  return Buffer.from(doc.output("arraybuffer"));
}

export interface PdfContent {
  project: {
    name: String;
    orderNumber: String;
  };
  recipient: {
    salutation: String;
    firstname: String;
    lastname: String;
    address: String;
  };
  date: Dayjs;
}
