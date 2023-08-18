import { Workbook } from "exceljs";
import { KWSExcelExportRequestedEvent } from "../slack/interaction-handler";
import { EventBridgeEvent } from "aws-lambda";
import { getActivities } from "../moco/activities";
import { groupBy } from "../util/groupBy";
import { KwsReport, ExcelReportRow } from "./kws-report.model";
import { getIssues } from "../kws-jira/issues";
import axios from "axios";
import { slackClient } from "../clients/slack";
import { tmpName } from "tmp-promise";
import { promises as fsPromises } from "fs";
import { Issue } from "../kws-jira/types/jira-types";
import { channelJoin } from "../slack/channel-join";
import { getProject } from "../moco/projects";
import { MocoProject } from "../moco/types/moco-types";
import dayjs from "dayjs";

export const eventHandler = async (event: EventBridgeEvent<string, KWSExcelExportRequestedEvent>) => {
  const project: MocoProject = await getProject(event.detail.projectId);

  const activities = await getActivities(
    dayjs(project.created_at).subtract(1, "year").format("YYYY-MM-DD"),
    dayjs().add(1, "year").format("YYYY-MM-DD"),
    project.id.toString(),
  );

  const flatActivities = activities.flat();

  const kwsReports: KwsReport[] = flatActivities.map((activity) => new KwsReport(activity));

  const excelReportRows: ExcelReportRow[] = [
    ...(await generateReportRowsByGrouping(kwsReports, "key", true)),
    ...(await generateReportRowsByGrouping(
      kwsReports.filter((report) => !report.key),
      "summary",
      false,
    )),
  ];

  const buffer = await buildExcelReport(project.name);

  // Only user/bots that have joined a channel can post files
  await channelJoin(event.detail.channelId);

  const filename = `${project.name}_report_${dayjs().format("YYYY-MM-DD")}.xlsx`;
  const upload = await slackClient.files.upload({
    channels: event.detail.channelId,
    file: buffer,
    title: filename,
    filetype: "xlsx",
    filename: filename,
  });

  console.log(
    await axios.post(event.detail.responseUrl, {
      replace_original: "false",
      text: `Here's the Excel file: ${upload.file.url_private}`,
    }),
  );

  async function buildExcelReport(projectName: string): Promise<Buffer> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("kws-report");

    // Define columns
    worksheet.columns = [
      { header: "Project ID", key: "projectId" },
      { header: "Task", key: "task" },
      { header: "Type", key: "type" },
      { header: "Key", key: "key" },
      { header: "Order Reference", key: "orderReference" },
      { header: "Summaries", key: "summaries" },
      { header: "Story Points", key: "storyPoints" },
      { header: "Estimated hours", key: "estimatedHours" },
      { header: "Hours Booked", key: "hoursBooked" },
      { header: "Billable Hours", key: "billableHours" },
      { header: "ratio", key: "sphb" },
      { header: "Booking Dates", key: "bookingDates" },
      { header: "Booked By", key: "bookedBy" },
    ];

    for (const excelReportRow of excelReportRows) {
      const rowValues = excelReportRow.toExcelRow();
      const row = {};
      worksheet.columns.forEach((column, index) => {
        row[column.key] = rowValues[index];
      });
      worksheet.addRow(row);
    }

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: worksheet.rowCount, column: worksheet.columnCount },
    };

    const sPHBColumn = worksheet.getColumn("sphb");

    sPHBColumn.eachCell({ includeEmpty: false }, function (cell, rowNumber) {
      if (rowNumber === 1) {
        return; // skip the header row
      }

      if (typeof cell.value === "string" && cell.value) {
        const value = parseFloat(cell.value.replace("%", ""));
        if (value < 120) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF90EE90" }, // light green color
          };
        } else {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF08080" }, // light red color
          };
        }
      }
    });

    const orderRefColumn = worksheet.getColumn("orderReference");

    orderRefColumn.eachCell({ includeEmpty: false }, function (cell, rowNumber) {
      if (rowNumber === 1) {
        return; // skip the header row
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fuzz = require("fuzzball");

      if (typeof cell.value === "string" && cell.value) {
        const bana = fuzz.ratio("Gewährleistung".toLowerCase(), cell.value.toLowerCase());
        const fuzziness = fuzz.ratio(projectName.toLowerCase(), cell.value.toLowerCase());
        if (fuzziness < 80 && bana < 80) {
          // adjust this ratio based on your requirement
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF08080" },
          };
        }
      }
    });

    worksheet.columns.forEach((column) => {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? String(cell.value).length : 10;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
      column.width = maxColumnLength + 2; // extra padding
    });

    const tmpFilePath = await tmpName();
    await workbook.xlsx.writeFile(tmpFilePath);

    return await fsPromises.readFile(tmpFilePath);
  }

  function buildExcelReportData(
    newExcelReport: ExcelReportRow,
    previousValue: ExcelReportRow,
    currentValue: KwsReport,
    hoursBooked: number,
    billableHours: number,
    ratio: number,
  ): ExcelReportRow {
    newExcelReport.tasks = [...previousValue.tasks, currentValue.task];
    newExcelReport.summaries = [...previousValue.summaries, currentValue.summary];
    newExcelReport.bookedBys = [...previousValue.bookedBys, currentValue.bookedBy];
    newExcelReport.bookingTimes = [...previousValue.bookingTimes, currentValue.bookingTime];
    newExcelReport.hoursBooked = hoursBooked;
    newExcelReport.billableHours = billableHours;
    newExcelReport.ratio = ratio;
    return newExcelReport;
  }

  async function generateReportRowsByGrouping(
    reports: KwsReport[],
    groupingKey: string,
    useIssueData: boolean,
  ): Promise<ExcelReportRow[]> {
    const groupedReports = groupBy(reports, (report) => report[groupingKey]);
    const reportRows: ExcelReportRow[] = [];

    if (useIssueData) {
      const keys = Object.keys(groupedReports).filter((key) => key);
      const issuesData = await getIssues(keys);
      const issuesDataMap = new Map(issuesData.map((issue) => [issue.key, issue]));

      for (const key in groupedReports) {
        if (!key) {
          continue;
        }
        const issueData = issuesDataMap.get(key);
        reportRows.push(generateExcelReportRow(groupedReports[key], issueData));
      }
    } else {
      for (const key in groupedReports) {
        reportRows.push(generateExcelReportRow(groupedReports[key], undefined));
      }
    }

    return reportRows;
  }

  function generateExcelReportRow(reports: KwsReport[], issueData: Issue): ExcelReportRow {
    return reports.reduce(
      (prevValue: ExcelReportRow, currValue: KwsReport) => {
        const hoursBooked = prevValue.hoursBooked + currValue.hoursBooked;
        const billableHours = prevValue.billableHours + currValue.billableHours;
        let ratio;
        if (issueData?.fields?.timeestimate) {
          ratio = hoursBooked && prevValue.estimatedHours ? (hoursBooked / prevValue.estimatedHours) * 100 : 0;
        } else {
          ratio = hoursBooked && prevValue.storyPoints ? (hoursBooked / ((prevValue.storyPoints / 1.5) * 8)) * 100 : 0;
        }
        const newExcelReport = new ExcelReportRow(currValue, issueData);

        return buildExcelReportData(newExcelReport, prevValue, currValue, hoursBooked, billableHours, ratio);
      },
      ExcelReportRow.buildBasicExcelRowFrom(reports[0], issueData),
    );
  }
};
