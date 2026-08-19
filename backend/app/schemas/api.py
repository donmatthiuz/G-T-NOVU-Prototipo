from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(part.capitalize() for part in tail)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ErrorResponse(ApiModel):
    code: str
    detail: str
    request_id: str


class UserProfileResponse(ApiModel):
    id: str
    first_name: str
    full_name: str
    email: EmailStr


class AuthSessionResponse(ApiModel):
    access_token: str
    expires_at: datetime
    user: UserProfileResponse


class LoginRequest(ApiModel):
    identifier: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class RegistrationContact(ApiModel):
    phone: str = Field(min_length=8, max_length=24)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SavingsCapacity(ApiModel):
    income_pattern: Literal["fixed", "variable", "mixed"]
    fixed_monthly_income_minor: int | None = Field(default=None, gt=0, le=1_000_000_000)
    variable_income_frequency: Literal["weekly", "biweekly", "irregular"] | None = None
    safe_monthly_savings_minor: int = Field(gt=0, le=100_000_000)

    @model_validator(mode="after")
    def validate_pattern(self) -> "SavingsCapacity":
        if self.income_pattern == "fixed":
            if self.fixed_monthly_income_minor is None:
                raise ValueError("El ingreso fijo mensual es obligatorio.")
            self.variable_income_frequency = None
        elif self.income_pattern == "variable":
            if self.variable_income_frequency is None:
                raise ValueError("La frecuencia del ingreso variable es obligatoria.")
            self.fixed_monthly_income_minor = None
        elif self.fixed_monthly_income_minor is None or self.variable_income_frequency is None:
            raise ValueError("El ingreso mixto requiere monto fijo y frecuencia variable.")
        return self


class PersonalGoalResponse(ApiModel):
    id: str
    name: str
    saved_amount: int
    target_amount: int
    weekly_contribution: int
    progress: int = Field(ge=0, le=100)
    currency: Literal["GTQ"] = "GTQ"


class ActivityResponse(ApiModel):
    id: str
    name: str
    date_label: str
    amount_label: str
    tone: Literal["success", "muted"]


class OverviewResponse(ApiModel):
    profile: UserProfileResponse
    personal_goal: PersonalGoalResponse
    personal_goals: list[PersonalGoalResponse]
    primary_goal_id: str
    shared_plans: list[dict]
    recent_activity: list[ActivityResponse]


class ConversationCreate(ApiModel):
    context_type: Literal["general", "goal", "shared_plan"] = "general"
    entity_id: str | None = None


class ConversationResponse(ApiModel):
    id: str
    title: str
    context_type: Literal["general", "goal", "shared_plan"]
    entity_id: str | None = None
    message_count: int
    last_message_at: datetime


class CopilotMessageResponse(ApiModel):
    id: str
    sender: Literal["user", "assistant", "system"]
    content: str
    kind: Literal["text", "recommendation", "action"] = "text"
    created_at: datetime


class MessagePage(ApiModel):
    items: list[CopilotMessageResponse]
    next_cursor: str | None = None


class CopilotMessageCreate(ApiModel):
    content: str = Field(min_length=1, max_length=2_000)
    client_message_id: str = Field(min_length=8, max_length=80)


class CopilotTurnResponse(ApiModel):
    user_message: CopilotMessageResponse
    assistant_message: CopilotMessageResponse
    duplicated: bool = False

