import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import { MocoContact, MocoProject } from "../moco/types/moco-types";

export const createCompletionNoticePdf = (project: MocoProject, contact: MocoContact): jsPDF => {
  const doc = new jsPDF({
    unit: "pt",
  });

  const title = contact.gender === "F" ? "geehrte Frau" : "geehrter Herr";

  doc
    .addImage(logo, 385, 45, 140, 28)
    .setFontSize(7)
    .text("newcubator GmbH | Bödekerstraße 22 | 30161 Hannover", 68, 130)
    .setFontSize(10)
    .text(project.billing_address.replace("\n", `\n${contact.firstname} ${contact.lastname}\n`), 68, 160)
    .text(dayjs().locale("de").format("D. MMMM YYYY"), 465, 220)
    .setFont("helvetica", "bold")
    .text("Fertigstellungsanzeige", 68, 275)
    .setFont("helvetica", "normal")
    .text(`Sehr ${title} ${contact.lastname},`, 68, 300)
    .text(
      `hiermit zeigen wir Ihnen an, dass wir alle von uns im Projekt ${project.name} mit der Auftragsnummer ${project.custom_properties.Bestellnummer} zu erbringenden Leistungen erbracht haben.`,
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
  return doc;
};
