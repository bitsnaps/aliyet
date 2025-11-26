# Proposal: Fix Contact Form Subject Field

## Why
The "Subject" field in the contact form is not displaying the required predefined options, leading to inconsistent user submissions.

## What Changes
This proposal outlines the modifications to fix the contact form's "Subject" field by ensuring it's a dropdown menu with the specified options. This includes:
-   Changing the field to a `USelect` component.
-   Populating it with `['Maintenance', 'Installation', 'Sales', 'Others']`.
-   Updating the form's state management to ensure correct behavior.