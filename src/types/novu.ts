export type CurrencyCode = "GTQ";

export interface UserProfile {
  id: string;
  firstName: string;
  fullName: string;
  email: string;
}

export interface PersonalGoal {
  id: string;
  name: string;
  savedAmount: number;
  targetAmount: number;
  weeklyContribution: number;
  progress: number;
  currency: CurrencyCode;
}

export type ActivityTone = "success" | "muted";

export interface ActivityItem {
  id: string;
  name: string;
  dateLabel: string;
  amountLabel: string;
  tone: ActivityTone;
}

export interface NovuOverview {
  profile: UserProfile;
  personalGoal: PersonalGoal;
  recentActivity: ActivityItem[];
}

export interface ApiRequest<TBody = unknown> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: TBody;
}

export interface ApiResponse<TData> {
  data: TData;
  status: number;
}

export interface ApiTransport {
  request<TData, TBody = unknown>(
    request: ApiRequest<TBody>,
  ): Promise<ApiResponse<TData>>;
}
