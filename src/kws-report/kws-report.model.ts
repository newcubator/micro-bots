import { MocoActivity } from "../moco/types/moco-types";
import { Issue } from "../kws-jira/types/jira-types";

abstract class AKwsReport {
  projectId: string;
  type: string; //Jira
  task: string; //Moco
  key: string; //Moco
  orderReference: string; //Jira
  storyPoints: number; //Jira
  hoursBooked: number; //Moco
  billableHours: number; //Moco
  ratio: number; //MocoJira
  estimatedHours: number; //Jira
}

export class ExcelReportRow extends AKwsReport {
  tasks: string[] = [];
  summaries: string[] = []; //Moco
  bookedBys: string[] = []; //Moco
  bookingTimes: string[] = []; //Moco
  constructor(kwsReport: KwsReport, jiraIssue?: Issue) {
    super();
    this.projectId = kwsReport.projectId;
    this.type = jiraIssue?.fields.issuetype.name;
    this.task = kwsReport.task;
    this.key = kwsReport.key;
    this.orderReference = jiraIssue?.fields.customfield_10089;
    this.storyPoints = jiraIssue?.fields.customfield_10027 ?? 0;
    this.estimatedHours = jiraIssue?.fields.timetracking?.originalEstimate
      ? ExcelReportRow.convertJiraTimeToHours(jiraIssue?.fields.timetracking?.originalEstimate)
      : jiraIssue?.fields.timeestimate
        ? jiraIssue?.fields.timeestimate / 60 / 60
        : 0;
    console.log("timetracking", jiraIssue?.fields.timetracking);
    console.log("timetracking_originalEstimate", jiraIssue?.fields.timetracking?.originalEstimate);
    console.log("timeestimate", jiraIssue?.fields.timeestimate);
    this.ratio = kwsReport.ratio;

    this.hoursBooked = kwsReport.hoursBooked;
    this.billableHours = kwsReport.billableHours;
  }

  public static buildBasicExcelRowFrom(kwsReport: KwsReport, jiraIssue?: Issue): ExcelReportRow {
    return new ExcelReportRow({ ...kwsReport, billableHours: 0, hoursBooked: 0 }, jiraIssue);
  }

  private static convertJiraTimeToHours(jiraTime: string): number {
    const parts = jiraTime.split(" ");

    let totalHours = 0;

    for (const part of parts) {
      if (part.endsWith("w")) {
        const weeks = parseFloat(part.replace("w", ""));
        totalHours += weeks * 5 * 8;
      } else if (part.endsWith("d")) {
        const days = parseFloat(part.replace("d", ""));
        totalHours += days * 8;
      } else if (part.endsWith("h")) {
        const hours = parseFloat(part.replace("h", ""));
        totalHours += hours;
      } else if (part.endsWith("m")) {
        const minutes = parseFloat(part.replace("m", ""));
        totalHours += minutes / 60;
      } else if (part.endsWith("s")) {
        const seconds = parseFloat(part.replace("s", ""));
        totalHours += seconds / 3600;
      }
    }

    return totalHours;
  }

  toExcelRow(): any {
    const bookingDates = this.bookingTimes.map((time) => new Date(time));

    const minDate = new Date(Math.min.apply(null, bookingDates));
    const maxDate = new Date(Math.max.apply(null, bookingDates));

    console.log(this);
    return [
      this.projectId,
      Array.from(new Set(this.tasks)).join(", "),
      this.type,
      this.key,
      this.orderReference,
      Array.from(new Set(this.summaries)).join(", "),
      this.storyPoints !== 0 ? this.storyPoints : undefined,
      this.estimatedHours !== 0 ? this.estimatedHours : undefined,
      this.hoursBooked,
      this.billableHours,
      this.ratio !== 0 ? this.ratio.toString().concat("%") : "",
      `${minDate.toISOString().split("T")[0]} - ${maxDate.toISOString().split("T")[0]}`,
      Array.from(new Set(this.bookedBys)).join(", "),
    ];
  }
}
export class KwsReport extends AKwsReport {
  summary: string; //Moco
  bookedBy: string; //Moco
  bookingTime: string;

  constructor(mocoActivity: MocoActivity) {
    super();
    this.projectId = mocoActivity.project.id.toString();
    this.task = mocoActivity.task.name;
    this.key = mocoActivity.tag;
    this.summary = mocoActivity.description;
    this.hoursBooked = mocoActivity.hours;
    this.billableHours = mocoActivity.billable ? mocoActivity.hours : 0;
    this.bookingTime = mocoActivity.date;
    this.bookedBy = mocoActivity.user.firstname + " " + mocoActivity.user.lastname;
  }
}
