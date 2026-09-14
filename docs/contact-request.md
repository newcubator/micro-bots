# Contact Request

`POST /contactRequest` completes the processing of a newcubator website inquiry after Brevo accepted the form:

1. Look up the Brevo contact by email to obtain its direct link.
2. Reuse the Moco person with the same email or create a new contact.
3. Post the inquiry summary and direct Moco and Brevo links to the Sales channel.

The endpoint accepts URL-encoded form fields and is restricted to the production, staging, and local newcubator website origins.

Required deployment variables in addition to the existing Moco and Slack tokens:

- `BREVO_API_KEY`: Brevo API key with contact read access.
- `SALES_CHANNEL`: Slack channel ID for the Sales channel.
