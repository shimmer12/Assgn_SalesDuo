# Frontend for SalesDuo

This React + Vite frontend allows users to:

- Submit an ASIN to view scraped and AI-optimized content.
- Compare original and optimized listings side-by-side.
- Browse recent optimization runs.

## Quick Start

1. **Install dependencies and start the development server**:
   ```powershell
   cd frontend_SalesDuo
   npm install
   npm run dev
   ```

2. **Configure the backend endpoint (optional)**:
   By default, the app connects to `http://localhost:3000`. To override, create a `.env` file with:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

## Key Features

- **API Endpoints**:
  - `POST /api/runs` - Start a new optimization run.
  - `GET /api/runs` - Retrieve recent runs.
  - `GET /api/runs/:asin` - Get runs for a specific ASIN.

- **Core Components**:
  - `AsinInputForm.tsx` - Form for ASIN submission.
  - `ComparisonView.tsx` - Side-by-side comparison of listings.
  - `RunsHistoryPage.tsx` - View history of optimization runs.

## Notes

- Backend responses are validated using Zod schemas in `src/schema/apiSchema.ts`.
- Built with Vite, React + TypeScript, and Tailwind CSS.

## Suggestions

- Add CI/CD workflows for automated builds and deployments.
- Implement integration tests to validate frontend-backend interactions.

