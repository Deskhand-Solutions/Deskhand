// Inject style block to hide all credential fields by default to avoid flash of unstyled content
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Hide all credential fields by default */
        .form-row[class*="field-cred_"],
        .form-row.field-integration_definitions {
            display: none !important;
        }
        /* Style for active rows */
        .form-row.dh-active-row {
            display: block !important;
        }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {
    // Helper function to update fields for a single form/inline container
    function updateFieldsForContainer(container, providerSelect) {
        const defsInput = container.querySelector('.dh-integration-defs');
        if (!defsInput) return;

        let defs = {};
        try {
            defs = JSON.parse(defsInput.value);
        } catch (e) {
            console.error('Failed to parse integration definitions', e);
            return;
        }

        const selectedProvider = providerSelect.value;
        const activeFields = defs[selectedProvider] || [];

        // Find all form rows that belong to credential fields
        const formRows = container.querySelectorAll('.form-row');
        formRows.forEach(row => {
            // Check if this row is for a credential field
            // Classes are usually like: "form-row field-cred_client_id"
            const classes = Array.from(row.classList);
            const credClass = classes.find(c => c.startsWith('field-cred_'));
            if (credClass) {
                const fieldKey = credClass.replace('field-', '');
                if (activeFields.includes(fieldKey)) {
                    row.classList.add('dh-active-row');
                } else {
                    row.classList.remove('dh-active-row');
                }
            }
        });
    }

    // Set up listeners for all provider_slug select fields
    function init() {
        const selects = document.querySelectorAll('select[name$="provider_slug"]');
        selects.forEach(select => {
            if (select.dataset.integrationInitialized) return;
            select.dataset.integrationInitialized = 'true';

            // Find the parent container
            // For stacked inline, it is .inline-related
            // For standalone, it is the form itself or #content-main
            let container = select.closest('.inline-related');
            if (!container) {
                container = select.closest('form');
            }
            if (!container) return;

            // Update on initial load
            updateFieldsForContainer(container, select);

            // Update on change
            select.addEventListener('change', () => {
                updateFieldsForContainer(container, select);
            });
        });
    }

    init();

    // Watch for newly added inline forms (Django admin's "Add another" button)
    const observer = new MutationObserver((mutations) => {
        let shouldInit = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                shouldInit = true;
            }
        });
        if (shouldInit) {
            init();
        }
    });

    const contentMain = document.getElementById('content-main') || document.body;
    observer.observe(contentMain, { childList: true, subtree: true });
});
