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
  timetracking?: TimeTracking;
}

export interface TimeTracking {
  originalEstimateSeconds: number;
}

export interface IssueTypes {
  name?: string;
}

export interface AffectedSprints {
  name?: string;
  startDate?: Date;
  endDate?: Date;
}
