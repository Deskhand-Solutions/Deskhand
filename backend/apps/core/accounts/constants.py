class RoleSlug:
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    MANAGER = "manager"
    USER = "user"


SYSTEM_ROLES: tuple[dict[str, str], ...] = (
    {
        "slug": RoleSlug.SUPER_ADMIN,
        "name": "Super Admin",
        "description": "Plattformweiter Vollzugriff.",
    },
    {
        "slug": RoleSlug.ORG_ADMIN,
        "name": "Organization Admin",
        "description": "Vollzugriff innerhalb der Organisation.",
    },
    {
        "slug": RoleSlug.MANAGER,
        "name": "Manager",
        "description": "Verwaltung von Teams und Modulen.",
    },
    {
        "slug": RoleSlug.USER,
        "name": "User",
        "description": "Standardzugriff für Organisationsmitglieder.",
    },
)
