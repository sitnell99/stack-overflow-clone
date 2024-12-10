import { UsersPermission } from '../../users/users.permission';
import { QuestionsPermission } from '../../questions/questions.permission';
import { TagsPermission } from '../../tags/tags.permission';
import { AnswersPermission } from '../../answers/answers.permission';

export const Permissions = {
  ...UsersPermission,
  ...QuestionsPermission,
  ...TagsPermission,
  ...AnswersPermission,
};

export type PermissionType =
  | UsersPermission
  | QuestionsPermission
  | TagsPermission
  | AnswersPermission;
