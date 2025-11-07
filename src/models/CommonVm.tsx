export interface CounterBoxValues {
  [key: string]: number | null;
}

export interface UserAccessVm {
  View: boolean;
  Create: boolean;
  Update: boolean;
  Delete: boolean;
  UserGroupId: number | null;
  IsMine: boolean;
}
