import { handler as birthday } from "./functions/birthday";
import { handler as bookIssueReminder } from "./functions/gitlab-issue-reminder";
import { handler as vacationHandover } from "./functions/vacation-handover";

const commands: Record<string, () => Promise<void>> = {
  birthday,
  "book-issue-reminder": bookIssueReminder,
  "vacation-handover": vacationHandover,
};

export const runCli = async (arguments_: string[]) => {
  const command = arguments_[0];
  const run = command ? commands[command] : undefined;

  if (!run) throw new Error(`Unknown command: ${command ?? "(missing)"}`);
  await run();
};

if (require.main === module) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
