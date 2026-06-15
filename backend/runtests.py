#!/usr/bin/env python
"""
Deskhand test entry point.

Django's default discovery struggles with nested app paths (apps.core.*).
This runner always executes the full critical test suite.
"""
import os
import sys

import django
from django.conf import settings
from django.test.utils import get_runner

TEST_MODULES = [
    "apps.core.accounts.tests",
    "apps.core.administration.tests",
    "apps.core.organizations.tests",
    "apps.core.module_registry.tests",
    "apps.ai.ai_core.tests",
    "apps.integrations.tests",
    "apps.modules.email_marketing.tests",
    "shared.tests",
]


def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    failures = test_runner.run_tests(TEST_MODULES)
    return int(bool(failures))


if __name__ == "__main__":
    sys.exit(main())
