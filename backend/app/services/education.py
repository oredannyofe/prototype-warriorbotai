from ..models.schemas import EducationItem

DATA = [
    EducationItem(
        id="genetics-basics",
        title="Sickle Cell Genetics 101",
        language="en",
        audience="adult",
        body=(
            "Sickle cell disease is inherited. Two sickle genes (SS) cause disease; one sickle + one normal (AS) is a carrier. Discuss screening with family."
        ),
    ),
    EducationItem(
        id="hydration",
        title="Hydration & Prevention",
        language="en",
        audience="teen",
        body=(
            "Staying well hydrated helps prevent vaso-occlusive crises. Carry water and aim for clear urine."
        ),
    ),
    EducationItem(
        id="nutrition",
        title="Nutrition Tips",
        language="en",
        audience="adult",
        body=(
            "Balanced diet with fruits, vegetables, and folate supports overall health."
        ),
    ),
    # Simple localized examples
    EducationItem(
        id="hydration-yo",
        title="Mimu omi pọ ati idena",
        language="yo",
        audience="adult",
        body=("Mimu omi to peye n ran lọwọ lati dinku ìrora. Ma gbe igo omi pẹlu rẹ lojoojumọ."),
    ),
    EducationItem(
        id="hydration-ha",
        title="Shan ruwa don kariya",
        language="ha",
        audience="adult",
        body=("Shan isasshen ruwa na rage yiwuwar rikicewa. Ka rika ɗaukar ruwa a kowane lokaci."),
    ),
]


def get_education(lang: str | None = None):
    if not lang:
        return DATA
    lang = lang.lower().split("-")[0]
    return [it for it in DATA if it.language == lang] or DATA
