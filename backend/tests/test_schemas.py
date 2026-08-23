import pytest
from bson import ObjectId
from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.api import ActivityResponse, ContributionCreate, SavingsCapacity
from app.services.contributions import ensure_same_request


def test_variable_income_discards_fixed_amount() -> None:
    capacity = SavingsCapacity.model_validate(
        {
            "incomePattern": "variable",
            "fixedMonthlyIncomeMinor": 999_00,
            "variableIncomeFrequency": "irregular",
            "safeMonthlySavingsMinor": 250_00,
        }
    )

    assert capacity.fixed_monthly_income_minor is None
    assert capacity.variable_income_frequency == "irregular"


def test_fixed_income_requires_monthly_amount() -> None:
    with pytest.raises(ValidationError, match="ingreso fijo mensual"):
        SavingsCapacity.model_validate(
            {"incomePattern": "fixed", "safeMonthlySavingsMinor": 250_00}
        )


def test_mixed_income_requires_both_inputs() -> None:
    with pytest.raises(ValidationError, match="ingreso mixto"):
        SavingsCapacity.model_validate(
            {
                "incomePattern": "mixed",
                "fixedMonthlyIncomeMinor": 500_000,
                "safeMonthlySavingsMinor": 250_00,
            }
        )


def test_expense_activity_keeps_type_amount_and_danger_tone() -> None:
    activity = ActivityResponse.model_validate(
        {
            "id": "activity-1",
            "name": "Transporte inesperado",
            "dateLabel": "Hoy",
            "amountLabel": "− Q 120",
            "amount": -120,
            "type": "expense",
            "tone": "expense",
        }
    )

    assert activity.type == "expense"
    assert activity.amount == -120
    assert activity.tone == "expense"


def test_contribution_contract_uses_minor_units_and_camel_case() -> None:
    contribution = ContributionCreate.model_validate(
        {
            "destinationType": "shared_plan",
            "destinationId": "66c000000000000000000003",
            "amountMinor": 20_000,
            "description": "Mi aporte semanal",
            "clientContributionId": "client-contribution-1",
        }
    )

    assert contribution.amount_minor == 20_000
    assert contribution.model_dump(by_alias=True)["destinationType"] == "shared_plan"


def test_contribution_rejects_values_below_one_quetzal() -> None:
    with pytest.raises(ValidationError):
        ContributionCreate.model_validate(
            {
                "destinationType": "goal",
                "destinationId": "66c000000000000000000002",
                "amountMinor": 99,
                "description": "Monto inválido",
                "clientContributionId": "client-contribution-2",
            }
        )


def test_contribution_rejects_fractional_quetzal_amounts() -> None:
    with pytest.raises(ValidationError):
        ContributionCreate.model_validate(
            {
                "destinationType": "goal",
                "destinationId": "66c000000000000000000002",
                "amountMinor": 150,
                "description": "Monto con centavos",
                "clientContributionId": "client-contribution-3",
            }
        )


def test_idempotency_key_cannot_be_reused_with_other_contribution_data() -> None:
    destination_id = ObjectId("66c000000000000000000002")
    payload = ContributionCreate.model_validate(
        {
            "destinationType": "goal",
            "destinationId": str(destination_id),
            "amountMinor": 20_000,
            "description": "Aporte semanal",
            "clientContributionId": "client-contribution-4",
        }
    )
    existing = {
        "destination": {"type": "goal", "id": destination_id},
        "amount_minor": 20_000,
        "description": "Aporte semanal",
    }

    ensure_same_request(existing, payload, destination_id)
    with pytest.raises(HTTPException) as error:
        ensure_same_request(existing, payload.model_copy(update={"amount_minor": 30_000}), destination_id)

    assert error.value.status_code == 409
