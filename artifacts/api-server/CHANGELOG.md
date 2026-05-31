# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-05-30

### Added
- **Deployment Workflow**: Created `workflow.md` to document the definitive steps for InsForge deployment (Compute & Vercel).
- **Backend Dockerization**: Optimized `Dockerfile` and moved it to workspace root to handle monorepo dependencies.
- **Vercel Build Skip**: Injected `vercel.json` into static dist to bypass remote build failures on InsForge.
- **Asynchronous API Spec**: Integrated Jules' refactor for async OpenAPI spec loading.
- **Test Suite**: Integrated `vitest` and added rate-limit error handling tests for AI integrations.

### Changed
- **Backend Architecture**: Migrated from OpenAI to Gemini 2.0 Flash as the primary AI engine.
- **Security**: Hardened admin routes with JWT middleware and removed debug endpoints.

### Fixed
- **Monorepo Build cycle**: Fixed `pnpm` path issues and established a "Build Local -> Deploy Static" pattern for reliable deployments.
- **DB Connection**: Successfully established connection and schema sync with InsForge Managed PostgreSQL.
