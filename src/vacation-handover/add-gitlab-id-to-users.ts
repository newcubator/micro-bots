import { getMembers } from "../gitlab/users";
import { MocoEmployment, MocoUserType } from "../moco/types/moco-types";
import { UserWithVacations } from "./get-users-with-start-and-end-date";

export type UserWithGitlabId = {
  user: MocoUserType;
  dates: string[];
  employment: MocoEmployment;
  gitlabId: string | undefined;
};

export const addGitlabIdToUsers = async (users: UserWithVacations[]): Promise<UserWithGitlabId[]> => {
  const gitlabNewcubatorGroupId = process.env.GITLAB_NEWCUBATOR_GROUP_ID;

  if (typeof gitlabNewcubatorGroupId === "undefined") {
    throw new Error("No GitLab newcubator group ID given!");
  }

  const usersWithGitlabIdPromises = users.map(async (user) => {
    const members = await getMembers(gitlabNewcubatorGroupId);
    const gitlabId = members.find(
      (member) =>
        member.name.toLowerCase().includes(user.user.firstname.toLowerCase()) &&
        member.name.toLowerCase().includes(user.user.lastname.toLowerCase()),
    )?.id;
    if (!gitlabId) {
      console.log(`No Gitlab ID found for ${user.user.firstname} ${user.user.lastname}`);
    }
    return {
      ...user,
      gitlabId,
    };
  });
  return await Promise.all(usersWithGitlabIdPromises);
};
