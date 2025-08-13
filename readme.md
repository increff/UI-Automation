This is the initial readme file.

## Cursor Knowledge Base Setup

This repo is configured to treat `cursor-ai-prd-workflow/` as a persistent knowledge base for Cursor.

- Rules are defined in `.cursor/rules/knowledge-prd-workflow.mdc` to always include all `cursor-ai-prd-workflow/**/*.md` files.
- The canonical PRD is auto-included via `.cursor/rules/knowledge-prd-input.mdc` targeting `input/prd1.txt`.
- Lovable design guidelines under `Lovable/` are auto-included via `.cursor/rules/knowledge-lovable.mdc`.

How it works in Cursor:
- When using the AI, Cursor automatically loads these docs as context and follows their workflows.
- For PRD/RFC work, the assistant will consult these files first and follow the structures in the templates.

To customize:
- Edit or add more rules under `.cursor/rules/*.mdc`.
- Update `input/prd1.txt` as your primary PRD source.
