export interface SprintIssues {
  maxResults?: number;
  total?: number;
  issues?: Issue[];
}

export interface Issue {
  id?: number;
  key?: string;
  fields?: Fields;
}

export interface Fields {
  issuetype?: IssueTypes;
  created?: string;
  description?: string;
  summary?: string;
  customfield_10027?: number;
  customfield_10089?: string;
  customfield_10010?: AffectedSprints[];
  timeestimate?: number;
  timetracking?: TimeTracking;
}

export interface IssueTypes {
  name?: string;
}

export interface AffectedSprints {
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TimeTracking {
  originalEstimate?: string;
  remainingEstimate?: string;
  timeSpent?: string;
  originalEstimateSeconds?: number;
  remainingEstimateSeconds?: number;
  timeSpentSeconds?: number;
}
