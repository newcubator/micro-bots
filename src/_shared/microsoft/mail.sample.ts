import { MicrosoftAttachment, MicrosoftMessage } from "./mail";

export const SAMPLE_MESSAGE: MicrosoftMessage = {
  id: "AQMkADQ3YTAyOWE2LTdjNjAtNDhjMy1iNWY4LTY0Y2RjODI0MmE0MABGAAAVc",
  from: {
    emailAddress: {
      address: "applicant@jestjs.io",
      name: "Job Applicant",
    },
  },
  subject: "Job Application",
  body: {
    content: "I would like to work for you",
  },
  hasAttachments: true,
  webLink: "https://outlook.office.com/mail/abc123",
};

export const SAMPLE_ATTACHMENT_1: MicrosoftAttachment = {
  contentId: "BD9DDB4C-2B48-4A5B-8F4D-D8327DCCC23D",
  name: "ori3.jpg",
  contentBytes: "some jpeg bytes ...",
  contentType: "image/jpeg",
  isInline: true,
};

export const SAMPLE_ATTACHMENT_2: MicrosoftAttachment = {
  contentId: "F2183E82104CCA4FB7A3E3B4C54F1BD1@EURP194.PROD.OUTLOOK.COM",
  name: "Lebenslauf.pdf",
  contentBytes: "some pdf bytes ...",
  contentType: "application/octet-stream",
  isInline: false,
};

export const SAMPLE_ATTACHMENTS: MicrosoftAttachment[] = [SAMPLE_ATTACHMENT_1, SAMPLE_ATTACHMENT_2];
