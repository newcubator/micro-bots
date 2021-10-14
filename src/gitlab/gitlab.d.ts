export interface GitlabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: null;
  closed_by: null;
  labels: string[];
  milestone: null;
  assignees: any[];
  author: Author;
  type: string;
  assignee: null;
  user_notes_count: number;
  merge_requests_count: number;
  upvotes: number;
  downvotes: number;
  due_date: null;
  confidential: boolean;
  discussion_locked: null;
  issue_type: string;
  web_url: string;
  time_stats: TimeStats;
  task_completion_status: TaskCompletionStatus;
  weight: null;
  blocking_issues_count: number;
  has_tasks: boolean;
  task_status: string;
  _links: Links;
  references: References;
  moved_to_id: null;
  service_desk_reply_to: null;
  epic_iid: null;
  epic: null;
}

interface Author {
  id: number;
  name: string;
  username: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

interface References {
  short: string;
  relative: string;
  full: string;
}

interface TaskCompletionStatus {
  count: number;
  completed_count: number;
}

interface TimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate: string;
  human_total_time_spent: string;
}

export interface GitlabIssueTemplate {
  name: string;
  content: string;
}

export interface GitlabProject {
  id?: number;
  description?: string;
  name?: string;
  name_with_namespace?: string;
  path?: string;
  path_with_namespace?: string;
  created_at?: string;
  tag_list?: any[];
  topics?: any[];
  ssh_url_to_repo?: string;
  http_url_to_repo?: string;
  web_url?: string;
  readme_url?: null;
  avatar_url?: null;
  forks_count?: number;
  star_count?: number;
  last_activity_at?: string;
  namespace?: Namespace;
  container_registry_image_prefix?: string;
  _links?: Links;
  packages_enabled?: boolean;
  empty_repo?: boolean;
  archived?: boolean;
  visibility?: string;
  resolve_outdated_diff_discussions?: boolean;
  container_expiration_policy?: ContainerExpirationPolicy;
  issues_enabled?: boolean;
  merge_requests_enabled?: boolean;
  wiki_enabled?: boolean;
  jobs_enabled?: boolean;
  snippets_enabled?: boolean;
  container_registry_enabled?: boolean;
  service_desk_enabled?: boolean;
  service_desk_address?: string;
  can_create_merge_request_in?: boolean;
  issues_access_level?: string;
  repository_access_level?: string;
  merge_requests_access_level?: string;
  forking_access_level?: string;
  wiki_access_level?: string;
  builds_access_level?: string;
  snippets_access_level?: string;
  pages_access_level?: string;
  operations_access_level?: string;
  analytics_access_level?: string;
  container_registry_access_level?: string;
  emails_disabled?: null;
  shared_runners_enabled?: boolean;
  lfs_enabled?: boolean;
  creator_id?: number;
  import_status?: string;
  open_issues_count?: number;
  ci_default_git_depth?: number;
  ci_forward_deployment_enabled?: boolean;
  ci_job_token_scope_enabled?: boolean;
  public_jobs?: boolean;
  build_timeout?: number;
  auto_cancel_pending_pipelines?: string;
  build_coverage_regex?: null;
  shared_with_groups?: any[];
  only_allow_merge_if_pipeline_succeeds?: boolean;
  allow_merge_on_skipped_pipeline?: null;
  restrict_user_defined_variables?: boolean;
  request_access_enabled?: boolean;
  only_allow_merge_if_all_discussions_are_resolved?: boolean;
  remove_source_branch_after_merge?: boolean;
  printing_merge_request_link_enabled?: boolean;
  merge_method?: string;
  squash_option?: string;
  suggestion_commit_message?: null;
  auto_devops_enabled?: boolean;
  auto_devops_deploy_strategy?: string;
  autoclose_referenced_issues?: boolean;
  keep_latest_artifact?: boolean;
  approvals_before_merge?: number;
  mirror?: boolean;
  external_authorization_classification_label?: string;
  marked_for_deletion_at?: null;
  marked_for_deletion_on?: null;
  requirements_enabled?: boolean;
  security_and_compliance_enabled?: boolean;
  compliance_frameworks?: any[];
  issues_template?: null;
  merge_pipelines_enabled?: boolean;
  merge_trains_enabled?: boolean;
  permissions?: Permissions;
}

export interface Links {
  self?: string;
  issues?: string;
  merge_requests?: string;
  repo_branches?: string;
  labels?: string;
  events?: string;
  members?: string;
}

export interface ContainerExpirationPolicy {
  cadence?: string;
  enabled?: boolean;
  keep_n?: number;
  older_than?: string;
  name_regex?: string;
  name_regex_keep?: null;
  next_run_at?: Date;
}

export interface Namespace {
  id?: number;
  name?: string;
  path?: string;
  kind?: string;
  full_path?: string;
  parent_id?: number;
  avatar_url?: string;
  web_url?: string;
}

export interface Permissions {
  project_access?: ProjectAccess;
  group_access?: null;
}

export interface ProjectAccess {
  access_level?: number;
  notification_level?: number;
}
