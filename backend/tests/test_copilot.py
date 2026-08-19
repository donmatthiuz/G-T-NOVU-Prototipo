import json

from app.integrations.openai_copilot import COPILOT_INSTRUCTIONS, render_financial_context


def test_copilot_prompt_has_financial_safety_boundaries() -> None:
    assert "no podés ejecutar aportes" in COPILOT_INSTRUCTIONS
    assert "No inventés saldos" in COPILOT_INSTRUCTIONS
    assert "contraseñas" in COPILOT_INSTRUCTIONS
    assert "Guatemala" in COPILOT_INSTRUCTIONS


def test_financial_context_is_serialized_as_data() -> None:
    rendered = render_financial_context(
        {
            "goals": [{"name": "Viaje", "saved_amount_minor": 125_000}],
            "recent_contributions": [{"amount_minor": 18_000}],
        }
    )
    payload = json.loads(rendered.split("\n", 1)[1])

    assert payload["goals"][0]["saved_amount_minor"] == 125_000
    assert payload["recent_contributions"][0]["amount_minor"] == 18_000

