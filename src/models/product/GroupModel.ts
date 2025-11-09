export interface GroupModel {
  GroupId: number;
  GroupName: string;
  GroupDescription?: string;
  CreatedAt: string;
  IsActive: boolean;

  // Parent Category info
  CategoryId: number;
  CategoryName: string;
  CategoryDescription?: string;
}
