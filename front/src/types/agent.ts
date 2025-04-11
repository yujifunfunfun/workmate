export interface MemberAgent {
  id: string;
  username: string;
  name: string;
  owner: string;
  department: string;
  description: string;
  skills: string[];
  avatarUrl?: string;
}
