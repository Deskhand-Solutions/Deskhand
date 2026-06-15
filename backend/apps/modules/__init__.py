"""
Platzhalter für KI-Automatisierungsmodule.

Jedes Modul = eigene Django-App unter apps/modules/<name>/:

    apps/modules/chatbot/
    apps/modules/document_analysis/
    apps/modules/email_marketing/

Nach Implementierung:
1. App in INSTALLED_APPS registrieren
2. MODULE_CONFIG + register_module() in module_registry
3. Datensatz in module_registry.Module anlegen
4. OrganizationModule im Admin freischalten
"""
