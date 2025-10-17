# Repository Guidelines

## Project Structure & Module Organization
- Application code lives in `src/WeatherForecast.Api`, which hosts the minimal API entry point, endpoint registrations, and dependency injection wiring.
- Shared domain models and services belong under `src/WeatherForecast.Core` with subfolders such as `Domain`, `Services`, and `Models` to preserve separation of concerns.
- Automated tests sit inside `tests/WeatherForecast.Api.Tests` and mirror the namespace and folder structure of the feature under test.
- Deployment assets and helper scripts are kept in `deploy/` and `scripts/`; update these when infrastructure or automation changes.

## Build, Test, and Development Commands
- `dotnet restore WeatherForecast.sln` downloads project dependencies; run after pulling new packages.
- `dotnet build WeatherForecast.sln -c Release` compiles all projects and surfaces analyzer warnings.
- `dotnet test WeatherForecast.sln --collect:"XPlat Code Coverage"` executes the full suite and saves coverage reports under `TestResults/`.
- `dotnet watch run --project src/WeatherForecast.Api` starts the API locally with hot reload for quick iteration.

## Coding Style & Naming Conventions
- Use 4-space indentation, PascalCase for classes and public members, and camelCase for locals and parameters, aligning with .NET conventions.
- Enable nullable reference types and apply guard clauses on public entry points to fail fast.
- Group endpoints by route segment within `Endpoints/{Feature}` folders, and keep DTOs in `Contracts/` to avoid leaking domain types.
- Run `dotnet format WeatherForecast.sln` before committing to enforce formatting and analyzer fixes.

## Testing Guidelines
- Prefer xUnit `[Fact]` for single-scenario tests and `[Theory]` with data attributes for matrix coverage.
- Name test classes `{TypeUnderTest}Tests` and methods `MethodName_State_ExpectedResult` to clarify intent.
- Maintain ≥80% line coverage on touched files; review the generated coverage summary in `TestResults/coverage.cobertura.xml`.
- Mock external integrations with Moq and add integration smoke tests under `tests/WeatherForecast.Api.Tests/Integration` when adding new endpoints.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`) and keep each commit focused on a single logical change.
- Include updated or new tests in the same commit when behavior changes.
- Pull requests must explain the problem, detail the solution, paste the latest `dotnet test` result, and link any tracking issues.
- Attach screenshots or curl transcripts for API contract changes and flag breaking changes directly in the PR title.

## Security & Configuration Tips
- Never commit secrets; store local secrets with `dotnet user-secrets` and document required keys in `README.md`.
- Provide safe defaults in `appsettings.Development.json` and note environment-specific overrides in `deploy/README.md`.
