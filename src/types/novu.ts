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
  personalGoals?: PersonalGoal[];
  primaryGoalId?: string;
  sharedPlans?: Array<Record<string, unknown>>;
  recentActivity: ActivityItem[];
}

export interface CopilotConversation {
  id: string;
  title: string;
  contextType: "general" | "goal" | "shared_plan";
  entityId: string | null;
  messageCount: number;
  lastMessageAt: string;
}

export interface CopilotMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  kind: "text" | "recommendation" | "action";
  createdAt: string;
}

export interface CopilotMessagePage {
  items: CopilotMessage[];
  nextCursor: string | null;
}

export interface CopilotTurn {
  userMessage: CopilotMessage;
  assistantMessage: CopilotMessage;
  duplicated: boolean;
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

export type CaptureKind = "dpi" | "selfie" | "proof";
export type CaptureSource = "camera" | "upload";
export type CaptureSlot = "dpiFront" | "dpiBack" | "selfie" | "proof";

export interface CapturedMedia {
  file: File;
  previewUrl: string;
  source: CaptureSource;
}

export interface RegistrationContact {
  phone: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export type IncomePattern = "fixed" | "variable" | "mixed";
export type VariableIncomeFrequency = "weekly" | "biweekly" | "irregular";

export interface RegistrationSavingsCapacity {
  incomePattern: IncomePattern;
  fixedMonthlyIncomeMinor?: number;
  variableIncomeFrequency?: VariableIncomeFrequency;
  safeMonthlySavingsMinor: number;
}

export type RegistrationContactErrors = Partial<
  Record<keyof RegistrationContact, string>
>;

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface RegistrationSubmission {
  contact: RegistrationContact;
  savingsCapacity: RegistrationSavingsCapacity;
  media: Partial<Record<CaptureSlot, File>>;
}
