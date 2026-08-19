import pytest
from pydantic import ValidationError

from app.schemas.api import SavingsCapacity


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

