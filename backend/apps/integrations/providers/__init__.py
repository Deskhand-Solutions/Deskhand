from apps.integrations.providers.google.client import GoogleIntegrationClient
from apps.integrations.providers.microsoft.client import MicrosoftIntegrationClient
from apps.integrations.providers.sap.client import SAPIntegrationClient
from apps.integrations.providers.shopify.client import ShopifyIntegrationClient
from apps.integrations.registry import (
    CredentialField,
    IntegrationDefinition,
    register_integration,
)


def register_builtin_providers() -> None:
    # 1. Google Integration
    register_integration(
        IntegrationDefinition(
            slug="google",
            name="Google",
            description="Google Workspace, Gmail, Calendar, and OAuth APIs.",
            client_class=GoogleIntegrationClient,
            auth_type="oauth",
            required_scopes=["openid", "email", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/calendar.events"],
            credential_fields=[
                CredentialField(key="client_id", label="Client ID", secret=False),
                CredentialField(key="client_secret", label="Client Secret", secret=True),
                CredentialField(key="refresh_token", label="Refresh Token", secret=True),
            ],
            sort_order=10,
        )
    )

    # 2. Microsoft Integration
    register_integration(
        IntegrationDefinition(
            slug="microsoft",
            name="Microsoft 365",
            description="Microsoft Office 365, Outlook Mail, Calendar, and Graph APIs.",
            client_class=MicrosoftIntegrationClient,
            auth_type="oauth",
            required_scopes=["offline_access", "User.Read", "Mail.Send", "Calendars.ReadWrite"],
            credential_fields=[
                CredentialField(key="client_id", label="Client ID", secret=False),
                CredentialField(key="client_secret", label="Client Secret", secret=True),
                CredentialField(
                    key="tenant_id",
                    label="Tenant ID",
                    secret=False,
                    help_text="z. B. 'common' oder Ihre Azure Active Directory ID.",
                ),
                CredentialField(key="refresh_token", label="Refresh Token", secret=True),
            ],
            sort_order=20,
        )
    )

    # 3. Shopify Integration
    register_integration(
        IntegrationDefinition(
            slug="shopify",
            name="Shopify",
            description="Shopify Admin REST API for products, orders, and customer master data.",
            client_class=ShopifyIntegrationClient,
            auth_type="credentials",
            credential_fields=[
                CredentialField(
                    key="shop_domain",
                    label="Shop-Domain",
                    secret=False,
                    help_text="z. B. mein-shop.myshopify.com",
                ),
                CredentialField(key="access_token", label="Admin Access Token", secret=True),
            ],
            sort_order=30,
        )
    )

    # 4. SAP Integration
    register_integration(
        IntegrationDefinition(
            slug="sap",
            name="SAP ERP",
            description="SAP NetWeaver Gateway OData REST APIs for customers and materials.",
            client_class=SAPIntegrationClient,
            auth_type="credentials",
            credential_fields=[
                CredentialField(
                    key="base_url",
                    label="SAP Gateway Base URL",
                    secret=False,
                    help_text="z. B. https://sap-gateway.firma.de:8000",
                ),
                CredentialField(key="username", label="SAP Benutzername", secret=False),
                CredentialField(key="password", label="SAP Passwort", secret=True),
            ],
            sort_order=40,
        )
    )
