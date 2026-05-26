# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **CRM Database Schemas**: Added Drizzle ORM schemas for `pacientes`, `leads_turismo`, `doctores`, and `citas` to enable full clinical CRM capabilities.
- **Insforge SDK Services**: Implemented `dbService.ts` to manage relational data persistence using the official `@insforge/sdk`. Includes operations to bypass RLS securely via service roles in backend context.
- **CalDAV Integration**: Built `caldavService.ts` to interface with doctors' iCloud calendars via CalDAV (`tsdav`) and insert RFC 5545 `.ics` event payloads (`ical-generator`).
- **Gemini AI Integration**: Added `@google/genai` to serve as the core intelligence engine for the assistant, superseding previous LLM strategies.
- **WhatsApp Bot Module**: Created `whatsappService.ts` leveraging `@whiskeysockets/baileys`.
  - Implements multi-device WebSocket connection.
  - Automatically renders authentication QR code via `qrcode-terminal`.
  - Features Gemini Function Calling to check availability, book appointments, view clinical histories, and append notes natively.

### Fixed
- **Google Maps Blocked Issue**: Documented mitigation for `ERR_BLOCKED_BY_CLIENT` on Maps JS API. Often caused by aggressive ad-blockers (e.g. Brave Shields, uBlock). Noted that asynchronous Maps loading should be gracefully handled so it doesn't break the React render cycle.
- **Backend Build Strategy**: Assured proper installation and path mapping for external dependencies and Drizzle generation schemas.

### Security
- Data persistence mechanisms assume strict backend-level authentication for bot mutations, utilizing explicit `INSFORGE_ANON_KEY` or JWT tokens per the platform's security framework.

### Deployment Notes
- **InsForge Deployment Challenges**: Encountered persistent issues with the `npx @insforge/cli deployments deploy` command, specifically `Error: Command "npm install" exited with 1` and `Error: Invalid token`, despite thorough local dependency management and explicit API key provision. This suggests a potential interaction issue with the InsForge CLI within the workspace environment, which could not be resolved from code modifications alone.
- **Frontend Deployment Challenges**: Further challenges encountered when deploying the frontend, including persistent 'vite build' attempts by InsForge despite minimalist `package.json` and explicit `vercel.json` configurations for static site deployment. This points to a deeper integration issue between the InsForge CLI's build pipeline and a pre-built static frontend within a complex monorepo structure.
