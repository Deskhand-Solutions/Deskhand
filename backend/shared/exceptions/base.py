class DeskhandError(Exception):
    """Basis-Exception für plattformweite Fehler."""


class ModuleNotEnabledError(DeskhandError):
    """Wird ausgelöst, wenn ein Modul für eine Organisation nicht freigeschaltet ist."""


class OrganizationAccessError(DeskhandError):
    """Wird ausgelöst, wenn ein Nutzer keine Berechtigung für eine Organisation hat."""


class DomainValidationError(DeskhandError):
    """Wird bei fachlicher Eingabe-Validierung ausgelöst (mappt auf HTTP 400)."""
