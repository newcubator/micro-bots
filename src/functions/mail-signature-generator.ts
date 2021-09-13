import { APIGatewayEvent } from "aws-lambda";
import { MocoUserType } from "../moco/types/moco-types";
import { findUserBySlackCommand, getUsers } from "../moco/users";

export const handler = async (event: APIGatewayEvent) => {
  const { user_id, user_name } = event.queryStringParameters;
  console.log("Query Params:", user_id, user_name);

  const user: MocoUserType = await getUsers().then(findUserBySlackCommand({ user_id, user_name }));

  console.log("USER", user);

  if (!user) {
    return {
      statusCode: 200,
      body: "Ich konnte dich leider keinem Moco User zuordnen.",
    };
  }

  console.log("Creating mail signature for", user.firstname, user.lastname);

  const signature = replaceUmlautsWithHtml(createMailSignature(user));

  return {
    statusCode: 200,
    body: `<body>
<div id="signature">${signature}</div>
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
    headers: {
      "Content-Type": "text/html;charset=utf-8",
    },
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

function createMailSignature(user: MocoUserType): string {
  const addressHannover = `Bödekerstraße 22, 30161 Hannover`;
  const addressDortmund = `Freie-Vogel-Straße 369, 44269 Dortmund`;

  return `<table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td style="vertical-align: top;"> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td style="text-align: center;"> <img src="https://newcubator.com/images/mailsignature/${replaceUmlauts(
    user.firstname.toLowerCase()
  )}-${replaceUmlauts(
    user.lastname.toLowerCase()
  )}.png" role="presentation" width="130" style="max-width: 128px; display: block;"> </td></tr><tr> <td height="30"></td></tr><tr> <td style="text-align: center;"> <img src="https://newcubator.com/images/mailsignature/nc-logo.png" role="presentation" width="130" style="max-width: 130px; display: block;"> </td></tr><tr> <td height="30"></td></tr><tr> <td style="text-align: center;"> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; display: inline-block;"> <tbody> <tr style="text-align: center;"> <td> <a href="https://twitter.com/newcubator?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" color="#50505E" style="display: inline-block; padding: 0px; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/twitter-icon-2x.png" alt="twitter" color="#50505E" height="24" style="background-color: rgba(255, 255, 255, 0); max-width: 135px; display: block;"> </a> </td><td width="5"> <div></div></td><td> <a href="https://www.linkedin.com/in/j%C3%B6rg-herbst-185101ba/" color="#50505E" style="display: inline-block; padding: 0px; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/linkedin-icon-2x.png" alt="linkedin" color="#50505E" height="24" style="background-color: rgba(255, 255, 255, 0); max-width: 135px; display: block;"> </a> </td><td width="5"> <div></div></td><td> <a href="https://www.instagram.com/newcubator/?hl=de" color="#50505E" style="display: inline-block; padding: 0px; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/instagram-icon-2x.png" alt="instagram" color="#50505E" height="24" style="background-color: rgba(255, 255, 255, 0); max-width: 135px; display: block;"> </a> </td><td width="5"> <div></div></td></tr></tbody> </table> </td></tr></tbody> </table> </td><td width="46"> <div></div></td><td style="padding: 0px; vertical-align: middle;"> <h3 color="#50505e" style="margin: 0px; font-size: 18px; color: rgb(80, 80, 94);"> <span>${
    user.firstname
  }</span> <span>${
    user.lastname
  }</span> </h3> <p color="#50505e" font-size="medium" style="margin: 0px; font-weight: 500; color: rgb(80, 80, 94); font-size: 14px; line-height: 22px;"><span>${
    user.custom_properties["Job Rolle"]
  }</span><span>&nbsp;|&nbsp;</span><span>newcubator GmbH</span> </p><p color="#50505e" font-size="medium" style="color: rgb(80, 80, 94); margin: 0px; font-size: 14px; line-height: 22px;"> <span>Geschäftsführer: Jörg Herbst</span> </p><table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial; width: 100%;"> <tbody> <tr> <td height="30"></td></tr><tr> <td color="#405780" direction="horizontal" height="1" style="width: 100%; border-bottom: 1px solid rgb(64, 87, 128); border-left: none; display: block;"></td></tr><tr> <td height="30"></td></tr></tbody> </table> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> ${
    user.work_phone
      ? ` <tr height="25" style="vertical-align: middle;"> <td width="30" style="vertical-align: middle;"> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td style="vertical-align: bottom;"> <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/phone-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);"> </span> </td></tr></tbody> </table> </td><td style="padding: 0px; color: rgb(80, 80, 94);"> <a href="tel:${user.work_phone}" color="#50505e" style="text-decoration: none; color: rgb(80, 80, 94); font-size: 12px;"> <span>${user.work_phone}</span> </a> </td></tr>`
      : ""
  }<tr height="25" style="vertical-align: middle;"> <td width="30" style="vertical-align: middle;"> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td style="vertical-align: bottom;"> <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/email-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);"> </span> </td></tr></tbody> </table> </td><td style="padding: 0px;"> <a href="mailto:${
    user.email
  }" color="#50505e" style="text-decoration: none; color: rgb(80, 80, 94); font-size: 12px;"> <span>${
    user.email
  }</span> </a> </td></tr><tr height="25" style="vertical-align: middle;"> <td width="30" style="vertical-align: middle;"> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td style="vertical-align: bottom;"> <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/link-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);"> </span> </td></tr></tbody> </table> </td><td style="padding: 0px;"> <a href="//newcubator.com" color="#50505e" style="text-decoration: none; color: rgb(80, 80, 94); font-size: 12px;"> <span>newcubator.com</span> </a> </td></tr><tr height="25" style="vertical-align: middle;"> <td width="30" style="vertical-align: middle;"> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td style="vertical-align: bottom;"> <span color="#405780" width="11" style="display: block; background-color: rgba(255, 255, 255, 0);"> <img src="https://newcubator.com/images/mailsignature/address-icon-2x.png" color="#405780" width="13" style="display: block; background-color: rgba(255, 255, 255, 0);"> </span> </td></tr></tbody> </table> </td><td style="padding: 0px;"> <span color="#50505e" style="font-size: 12px; color: rgb(80, 80, 94);"> <span>${
    user.custom_properties.Standort === "Dortmund" ? addressDortmund : addressHannover
  }, Amtsgericht Hannover HRB 221930</span> </span> </td></tr></tbody> </table> <table cellpadding="0" cellspacing="0" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family: Arial;"> <tbody> <tr> <td height="30"></td></tr></tbody> </table> </td></tr></tbody> </table> </td></tr></tbody></table>
`;
}
