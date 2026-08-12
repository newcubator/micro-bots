import { HttpRequest, HttpResponse } from "../http/types";
import { MocoUserType } from "../moco/types/moco-types";
import { findUserBySlackCommand, getUsers } from "../moco/users";
import { SignatureType } from "./mail-signature";

const toSignatureType = (value: string | undefined): SignatureType =>
  value === SignatureType.STADTQUEST ? SignatureType.STADTQUEST : SignatureType.NEWCUBATOR;

const getJobTitle = (user: MocoUserType, selectedJobTitle: string | undefined) =>
  selectedJobTitle?.trim() || user.custom_properties["Job Bezeichnung"];

const getSignatureConfig = (signatureType: SignatureType, user: MocoUserType) => {
  if (signatureType === SignatureType.STADTQUEST) {
    return {
      logoUrl: "https://stadtquest.de/mailsignature/stadtquest-logo.png",
      companyName: "StadtQUEST ein Produkt der Newcubator GmbH",
      contactHref: "https://stadtquest.de/praxisimpulse/#newsletter",
      contactText: "Unser Newsletter",
      websiteHref: "https://stadtquest.de",
      websiteText: "stadtquest.de",
      linkedInHref: "https://www.linkedin.com/company/stadtquest/",
      instagramHref: "https://www.instagram.com/stadtquest/",
      footerHref: "https://stadtquest.de/email-marketing-banner",
      footerImageUrl: "https://stadtquest.de/mailsignature/mail-footer-image.jpg",
      footerImageAlt: "StadtQUEST banner",
    };
  }

  return {
    logoUrl: "https://newcubator.com/images/mailsignature/nc-logo.png",
    companyName: "newcubator GmbH",
    contactHref: `mailto:${user.email}`,
    contactText: user.email,
    websiteHref: "https://newcubator.com",
    websiteText: "newcubator.com",
    linkedInHref: "https://www.linkedin.com/company/newcubator/",
    instagramHref: "https://www.instagram.com/newcubator/?hl=de",
    footerHref: "https://newcubator.com/email-marketing-banner",
    footerImageUrl: "https://newcubator.com/images/email-marketing-banner/email-footer-image.jpg",
    footerImageAlt: "newcubator banner",
  };
};

export const handler = async (event: HttpRequest): Promise<HttpResponse> => {
  const user_id = event.query?.user_id;
  const user_name = event.query?.user_name;
  const signatureType = toSignatureType(event.query?.signature_type);
  console.log("Query Params:", user_id, user_name);

  const user: MocoUserType | undefined = await getUsers().then(findUserBySlackCommand({ user_id, user_name }));

  if (!user) {
    return {
      statusCode: 200,
      body: "Ich konnte dich leider keinem Moco User zuordnen.",
    };
  }

  console.log("Creating mail signature for", user.firstname, user.lastname);

  const signature = replaceUmlautsWithHtml(
    createMailSignature(user, getJobTitle(user, event.query?.job_title), signatureType),
  );

  return {
    statusCode: 200,
    body: `<body>
<div id="signature" data-signature-type="${signatureType}">${signature}</div>
    <button onclick="copy()">Copy to Clipboard</button>
</body>
<script type="text/javascript">
function replaceUmlautsWithHtml(str) {
  return str
    .replace(/ä/g, "&auml;")
    .replace(/ö/g, "&ouml;")
    .replace(/ü/g, "&uuml;")
    .replace(/ß/g, "&szlig;")
    .replace(/Ä/g, "&Auml;")
    .replace(/Ö/g, "&Ouml;")
    .replace(/Ü/g, "&Uuml;");
}

function copy() {
    navigator.clipboard.writeText(replaceUmlautsWithHtml(document.getElementById('signature').innerHTML));
}
</script>`,
    headers: { "Content-Type": "text/html;charset=utf-8" },
  };
};

function replaceUmlautsWithHtml(str: string): string {
  return str
    .replace(/ä/g, "&auml;")
    .replace(/ö/g, "&ouml;")
    .replace(/ü/g, "&uuml;")
    .replace(/ß/g, "&szlig;")
    .replace(/Ä/g, "&Auml;")
    .replace(/Ö/g, "&Ouml;")
    .replace(/Ü/g, "&Uuml;");
}

function replaceUmlauts(str: string): string {
  return str
    .replace(/\u00c4/g, "ae")
    .replace(/\u00e4/g, "ae")
    .replace(/\u00d6/g, "oe")
    .replace(/\u00f6/g, "oe")
    .replace(/\u00dc/g, "ue")
    .replace(/\u00fc/g, "ue")
    .replace(/\u00df/g, "ss");
}

function createMailSignature(user: MocoUserType, jobTitle: string, signatureType: SignatureType): string {
  const addressHannover = `Bödekerstraße 22, 30161 Hannover`;
  const addressDortmund = `Ruhrallee 9, 44139 Dortmund`;
  const phoneNumber = user.mobile_phone?.trim() || user.work_phone?.trim() || "+49 511 95731300";
  const signatureConfig = getSignatureConfig(signatureType, user);

  // prettier-ignore
  return `
<table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
  <tbody>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
          <tbody>
            <tr>
              <td style="vertical-align: top;">
                <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                  <tbody>
                    <tr>
                      <td style="text-align: center;">
                        <img src="https://newcubator.com/images/mailsignature/${replaceUmlauts(user.firstname.toLowerCase())}-${replaceUmlauts(user.lastname.toLowerCase())}.png" role="presentation" width="130" style="max-width: 128px; display: block;">
                      </td>
                    </tr>
                    <tr>
                      <td height="30"></td>
                    </tr>
                      <tr>
                        <td style="text-align: center;">
                          <img src="${signatureConfig.logoUrl}" role="presentation" width="130" style="max-width: 130px; display: block;">
                        </td>
                      </tr>
                    <tr>
                      <td height="30"></td>
                    </tr>
                    <tr>
                      <td style="text-align: center;">
                        <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; display: inline-block;">
                          <tbody>
                            <tr style="text-align: center;">
                              <td width="5">
                                <div></div>
                              </td>
                              <td>
                                <a href="${signatureConfig.linkedInHref}" color="#50505E" style="display: inline-block; padding: 0px; background-color: rgba(255, 255, 255, 0);">
                                  <img src="https://newcubator.com/images/mailsignature/linkedin-icon-2x.png" alt="linkedin" color="#50505E" height="24" style="background-color: rgba(255, 255, 255, 0); max-width: 135px; display: block;">
                                </a>
                              </td>
                              <td width="5">
                                <div></div>
                              </td>
                              <td>
                                <a href="${signatureConfig.instagramHref}" color="#50505E" style="display: inline-block; padding: 0px; background-color: rgba(255, 255, 255, 0);">
                                  <img src="https://newcubator.com/images/mailsignature/instagram-icon-2x.png" alt="instagram" color="#50505E" height="24" style="background-color: rgba(255, 255, 255, 0); max-width: 135px; display: block;">
                                </a>
                              </td>
                              <td width="5">
                                <div></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td width="46">
                <div></div>
              </td>
              <td style="padding: 0px; vertical-align: middle;">
                <h3 color="#50505e" style="margin: 0px; font-size: 18px; color: rgb(80, 80, 94);">
                  <span>${user.firstname}</span> <span>${user.lastname}</span>
                </h3>
                <p color="#50505e" font-size="medium" style="margin: 0px; font-weight: 500; color: rgb(80, 80, 94); font-size: 14px; line-height: 22px;">
                  <span>${jobTitle}</span><span>&nbsp;|&nbsp;</span><span>${signatureConfig.companyName}</span>
                </p>
                <p color="#50505e" font-size="medium" style="color: rgb(80, 80, 94); margin: 0px; font-size: 14px; line-height: 22px;">
                  <span>Geschäftsführer: Jörg Herbst</span>
                </p>
                <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; width: 100%;">
                  <tbody>
                    <tr>
                      <td height="30"></td>
                    </tr>
                    <tr>
                      <td color="#405780" direction="horizontal" height="1" style="width: 100%; border-bottom: 1px solid rgb(64, 87, 128); border-left: none; display: block;"></td>
                    </tr>
                    <tr>
                      <td height="30"></td>
                    </tr>
                  </tbody>
                </table>
                <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                  <tbody>
                    <tr height="25" style="vertical-align: middle;">
                      <td width="30" style="vertical-align: middle;">
                        <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                          <tbody>
                            <tr>
                              <td style="vertical-align: bottom;">
                                <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                  <img src="https://newcubator.com/images/mailsignature/phone-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style="padding: 0px; color: rgb(80, 80, 94);">
                        <a href="tel:${phoneNumber}" color="#50505e" style="text-decoration: none; color: rgb(80, 80, 94); font-size: 12px;">
                          <span>${phoneNumber}</span>
                        </a>
                      </td>
                    </tr>
                    <tr height="25" style="vertical-align: middle;">
                      <td width="30" style="vertical-align: middle;">
                        <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                          <tbody>
                            <tr>
                              <td style="vertical-align: bottom;">
                                <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                  <img src="https://newcubator.com/images/mailsignature/email-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style="padding: 0px;">
                        <a href="${signatureConfig.contactHref}" color="#50505e" style="text-decoration: none; color: rgb(80, 80, 94); font-size: 12px;">
                          <span>${signatureConfig.contactText}</span>
                        </a>
                      </td>
                    </tr>
                    <tr height="25" style="vertical-align: middle;">
                      <td width="30" style="vertical-align: middle;">
                        <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                          <tbody>
                            <tr>
                              <td style="vertical-align: bottom;">
                                <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                  <img src="https://newcubator.com/images/mailsignature/link-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style="padding: 0px;">
                        <a href="${signatureConfig.websiteHref}" color="#50505e" style="text-decoration: none; color: rgb(80, 80, 94); font-size: 12px;">
                          <span>${signatureConfig.websiteText}</span>
                        </a>
                      </td>
                    </tr>
                    <tr height="25" style="vertical-align: middle;">
                      <td width="30" style="vertical-align: middle;">
                        <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                          <tbody>
                            <tr>
                              <td style="vertical-align: bottom;">
                                <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                  <img src="https://newcubator.com/images/mailsignature/address-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);">
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style="padding: 0px;">
                        <span color="#50505e" style="font-size: 12px; color: rgb(80, 80, 94);">
                          <span>${user.custom_properties.Standort === "Dortmund" ? addressDortmund : addressHannover}, Amtsgericht Hannover HRB 221930</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;">
                  <tbody>
                    <tr>
                      <td height="30"></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <a href="${signatureConfig.footerHref}" style="display: inline-block; padding: 0; background-color: rgba(255, 255, 255, 0);">
          <img src="${signatureConfig.footerImageUrl}" alt="${signatureConfig.footerImageAlt}" width="${user.custom_properties.Standort === "Dortmund" ? '614' : '593'}" style="display: block;">
        </a>
      </td>
    </tr>
  </tbody>
</table>
`;
}
