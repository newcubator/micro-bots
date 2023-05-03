import { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { getMessage, getMessageAttachments, markMessageAsRead, moveMessage } from "../_shared/microsoft/mail";
import { GitlabIssue } from "../gitlab/gitlab";
import { getIssueTemplateByName } from "../gitlab/templates";
import { createIssue, updateIssueDescription, uploadFile } from "../gitlab/issues";

const GITLAB_PROJECT_ID = "35095396";
const TEMPLATE_NAME = "Bewerbung";
const MAIL_USER_PRINCIPAL_NAME = "info@newcubator.com";
const MAIL_ARCHIVE_FOLDER_ID =
  "AAMkAGJmODcwNWExLWM3ZmItNGNlZS04N2Q2LTc4YTJkMTZkOGJmOQAuAAAAAACsW_joJTKFSIXU5SXQHv11AQA4LQp9ObtJT7LiE4tqoOmkAAOkGk5ZAAA=";
const MAIL_LINK_TEMPLATE = `
<b><a href="mailto:[RECIPIENT]?bcc=incoming+newcubator-people-employees-35095396-dxmv8fhkpi28plc4lptak2z5l-issue-[IID]@incoming.gitlab.com"> >> Mail senden und als Kommentar anhängen</a></b>
`;

export const handler = async (event: APIGatewayRequestAuthorizerEventV2) => {
  let messageId = event.queryStringParameters.id;
  console.log("messageId", messageId);

  if (!messageId) {
    console.error("No messageId found");
    return {
      statusCode: 400,
      body: "Missing 'messageId'",
    };
  }

  const [message, attachments, template] = await Promise.all([
    getMessage(MAIL_USER_PRINCIPAL_NAME, messageId),
    getMessageAttachments(MAIL_USER_PRINCIPAL_NAME, messageId),
    getIssueTemplateByName(GITLAB_PROJECT_ID, TEMPLATE_NAME),
  ]);

  // update id with immutable id
  messageId = message.id;

  let description = template.content;
  description = description.replace("[NAME]", message.from.emailAddress.name);
  description = description.replace("[EMAIL]", message.from.emailAddress.address);
  description = description.replace("[BODY]", message.body.content);
  description = description.replace("[WEBLINK]", message.webLink);

  await Promise.all(
    attachments.map(async (attachment) => {
      const upload = await uploadFile(
        GITLAB_PROJECT_ID,
        attachment.contentBytes,
        attachment.contentType,
        attachment.name
      );
      if (attachment.isInline) {
        description = description.replace(`[cid:${attachment.contentId}]`, upload.markdown);
      } else {
        description += `\r\n${upload.markdown}`;
      }
    })
  );

  const issue = await createIssue(GITLAB_PROJECT_ID, message.subject, description);

  await Promise.all([
    updateIssueWithMailLink(issue, message.from.emailAddress.address),
    markMessageAsRead(MAIL_USER_PRINCIPAL_NAME, messageId),
    moveMessage(MAIL_USER_PRINCIPAL_NAME, messageId, MAIL_ARCHIVE_FOLDER_ID),
  ]);

  return {
    statusCode: 200,
    body: JSON.stringify({
      result: "Done",
    }),
  };
};

async function updateIssueWithMailLink(issue: GitlabIssue, recipient: string) {
  let link = MAIL_LINK_TEMPLATE;
  link = link.replace("[IID]", issue.iid.toString());
  link = link.replace("[RECIPIENT]", recipient);
  return updateIssueDescription(GITLAB_PROJECT_ID, issue.iid, link + issue.description);
}
