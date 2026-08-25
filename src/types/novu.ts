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

export type SharedPlanType = "group_challenge" | "family_fund";

export interface SharedPlan {
  id: string;
  name: string;
  type: SharedPlanType;
  balanceAmount: number;
  targetAmount: number;
  currency: CurrencyCode;
  status: string;
}

export type ActivityTone = "success" | "expense" | "muted";
export type ActivityType = "contribution" | "expense" | "info";

export interface ActivityItem {
  id: string;
  name: string;
  dateLabel: string;
  amountLabel: string;
  amount: number | null;
  type: ActivityType;
  tone: ActivityTone;
}

export interface NovuOverview {
  profile: UserProfile;
  personalGoal: PersonalGoal;
  personalGoals?: PersonalGoal[];
  primaryGoalId?: string;
  sharedPlans?: SharedPlan[];
  recentActivity: ActivityItem[];
  activityHistory: ActivityItem[];
}

export type ContributionDestinationType = "goal" | "shared_plan";

export interface ContributionItem {
  id: string;
  destinationType: ContributionDestinationType;
  destinationId: string;
  memberName: string;
  description: string;
  amount: number;
  amountLabel: string;
  dateLabel: string;
  occurredAt: string;
  currentMonth: boolean;
  status: "pending" | "posted" | "failed" | "reversed";
}

export interface ContributionPage {
  items: ContributionItem[];
}

export interface ContributionCreate {
  destinationType: ContributionDestinationType;
  destinationId: string;
  amountMinor: number;
  description: string;
  clientContributionId: string;
}

export interface ContributionCreateResponse {
  contribution: ContributionItem;
  updatedBalanceAmount: number;
  updatedProgress: number;
  duplicated: boolean;
}

export type WithdrawalStatus =
  "pending" | "approved" | "rejected" | "executed" | "cancelled";

export type WithdrawalDecision = "approve" | "reject";

export interface WithdrawalItem {
  id: string;
  sharedPlanId: string;
  requesterId: string;
  requesterName: string;
  amount: number;
  amountLabel: string;
  reason: string;
  requiredVotes: number;
  approveVotes: number;
  rejectVotes: number;
  remainingApprovals: number;
  currentUserVote: WithdrawalDecision | null;
  status: WithdrawalStatus;
  createdAt: string;
  decidedAt: string | null;
  executedAt: string | null;
  canVote: boolean;
  canExecute: boolean;
}

export interface WithdrawalPage {
  items: WithdrawalItem[];
}

export interface WithdrawalCreate {
  amountMinor: number;
  reason: string;
}

export interface WithdrawalVoteCreate {
  decision: WithdrawalDecision;
  comment?: string;
}

export interface WithdrawalExecutionResponse {
  withdrawal: WithdrawalItem;
  updatedBalanceAmount: number;
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
