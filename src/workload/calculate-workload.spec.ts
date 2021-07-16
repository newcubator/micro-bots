import { calculateWorkload } from "./calculate-workload";

describe("Workload Calculation", () => {
  it("should calculate the workload for one day", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-01"; // friday
    const activities: any[] = [{ date: "2021-01-01", hours: 8 }];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one day and multiple activities", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-01"; // friday
    const activities: any[] = [
      { date: "2021-01-01", hours: 1 },
      { date: "2021-01-01", hours: 3 },
      { date: "2021-01-01", hours: 4 },
    ];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one day for a half time employee", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-01"; // friday
    const activities: any[] = [
      { date: "2021-01-01", hours: 1 },
      { date: "2021-01-01", hours: 3 },
    ];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [0, 0, 0, 0, 0],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one day with no activities", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-01"; // friday
    const activities: any[] = [];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one day with absences", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-01"; // friday
    const activities: any[] = [];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [
      {
        date: "2021-01-01",
        assignment: {
          name: "Urlaub",
        },
        am: true,
        pm: true,
      },
    ];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one week", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-08"; // friday
    const activities: any[] = [
      { date: "2021-01-01", hours: 8 },
      { date: "2021-01-04", hours: 8 },
      { date: "2021-01-05", hours: 8 },
      { date: "2021-01-06", hours: 8 },
      { date: "2021-01-07", hours: 8 },
      { date: "2021-01-08", hours: 8 },
    ];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one week with overtime and undertime", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-08"; // friday
    const activities: any[] = [
      { date: "2021-01-01", hours: 10 },
      { date: "2021-01-04", hours: 8 },
      { date: "2021-01-05", hours: 8 },
      { date: "2021-01-06", hours: 8 },
      { date: "2021-01-07", hours: 6 },
      { date: "2021-01-08", hours: 8 },
    ];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one week for part time employees", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-08"; // friday
    const activities: any[] = [
      { date: "2021-01-01", hours: 4 },
      { date: "2021-01-04", hours: 4 },
      { date: "2021-01-05", hours: 4 },
      { date: "2021-01-06", hours: 8 },
      { date: "2021-01-07", hours: 0 },
      { date: "2021-01-08", hours: 4 },
    ];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 0, 4, 0, 4],
          pm: [0, 4, 4, 0, 0],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload for one week with absences", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-08"; // friday
    const activities: any[] = [{ date: "2021-01-01", hours: 8 }];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [
      { date: "2021-01-04", assignment: { name: "Feiertag" }, am: true, pm: true },
      { date: "2021-01-05", assignment: { name: "Urlaub" }, am: true, pm: true },
      { date: "2021-01-06", assignment: { name: "Nicht planbar" }, am: true, pm: true },
      { date: "2021-01-07", assignment: { name: "Krankheit" }, am: true, pm: true },
      { date: "2021-01-08", assignment: { name: "Abwesenheit" }, am: true, pm: true },
    ];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });

  it("should calculate the workload and respect the given time frame", () => {
    const from = "2021-01-01"; // friday
    const to = "2021-01-04"; // monday
    const activities: any[] = [
      { date: "2021-01-01", hours: 8 },
      { date: "2021-01-04", hours: 8 },
      { date: "2021-12-31", hours: 1 }, // not in time frame
      { date: "2021-01-05", hours: 1 }, // not in time frame
    ];
    const employments: any[] = [
      {
        from: "2020-01-01",
        to: "2022-01-01",
        pattern: {
          am: [4, 4, 4, 4, 4],
          pm: [4, 4, 4, 4, 4],
        },
        user: { id: "92ee20b5-0721-4d43-8d60-6dc87ccc50e8" /* id is enough for testing*/ },
      },
    ];
    const schedules: any[] = [
      { date: "2021-01-05", assignment: { name: "Urlaub" }, am: true, pm: true }, // not in time frame
      { date: "2021-12-31", assignment: { name: "Urlaub" }, am: true, pm: true }, // not in time frame
    ];

    const workload = calculateWorkload(from, to, activities, employments, schedules);

    expect(workload).toMatchSnapshot();
  });
});
