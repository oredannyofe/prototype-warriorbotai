from ..models.schemas import TherapySimInput, TherapySimResponse

def simulate_therapy(inp: TherapySimInput) -> TherapySimResponse:
    base = inp.baseline_crises_per_year
    if inp.therapy.lower() == "crispr":
        reduction = 0.75
        side_fx = 0.18
        life_gain = 12.0
        rationale = "Based on early gene-editing trial effects on HbF and crisis frequency."
    elif inp.therapy.lower() == "voxelotor":
        reduction = 0.35
        side_fx = 0.08
        life_gain = 4.0
        rationale = "HbS polymerization inhibition may reduce hemolysis and crises."
    else:  # hydroxyurea as default
        reduction = 0.5
        side_fx = 0.12
        life_gain = 7.0
        rationale = "HbF induction with established crisis reduction."

    # Adjust for age/genotype lightly
    age_factor = 0.9 if inp.age > 35 else 1.0
    projected_reduction = max(0.0, min(0.95, reduction * age_factor))

    return TherapySimResponse(
        expected_crisis_reduction_pct=round(projected_reduction * 100, 1),
        side_effect_risk_pct=round(side_fx * 100, 1),
        projected_life_expectancy_gain_years=round(life_gain * age_factor, 1),
        rationale=rationale,
    )
