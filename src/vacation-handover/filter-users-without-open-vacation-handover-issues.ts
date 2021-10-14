import { GitlabIssue } from '../gitlab/gitlab';
import { MocoSchedule, MocoUserType } from '../moco/types/moco-types';

export const filterUsersWithoutOpenVacationHandoverIssues = (
  schedules: MocoSchedule[],
  issues: GitlabIssue[]
): MocoUserType[] => {
  return schedules
    .map((schedule) => schedule.user)
    .filter(
      (user) =>
        !issues.some((issue) => issue.state === "opened" && issue.title.includes(`${user.firstname} ${user.lastname}`))
    );
};
