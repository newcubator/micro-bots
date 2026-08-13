import dayjs from "dayjs";
import { renderShortMailPdf } from "./pdf";

test("renders decomposed umlauts with the standard PDF font", async () => {
  const pdf = await renderShortMailPdf({
    sender: "Jörg Mustermann",
    location: "D",
    recipient: {
      salutation: "Sehr geehrte/r Frau/Herr Gra\u0308fenka\u0308mper",
      firstname: "Hendrik",
      lastname: "Gra\u0308fenka\u0308mper",
      address: "\nHendrik Gra\u0308fenka\u0308mper\nMusterstraße 1\n44139 Dortmund",
    },
    date: dayjs("2026-08-13"),
    text: "Bitte melden Sie sich bei Fragen mit einem zerlegten Umlaut: a\u0308.",
  });

  expect(pdf).toBeInstanceOf(Buffer);
  expect(pdf.length).toBeGreaterThan(0);
});
