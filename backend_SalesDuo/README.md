# Backend API for SalesDuo

This backend service powers the SalesDuo platform by providing APIs to:

- Scrape Amazon product pages for ASIN details (title, bullets, description).
- Generate optimized content using OpenAI (title, bullets, description, keywords).
- Store original and optimized data in MySQL via Drizzle ORM.

## Project Structure

- `src/` - Contains the Express server, controllers, services, and Drizzle schema.
- `docker-compose.yml` - Local MySQL setup for development.

## Quick Start

1. **Install dependencies and start the database**:

   ```powershell
   cd backend_SalesDuo
   npm install
   npm run db:up
   ```

2. **Set up environment variables**:

   Create a `.env` file in the project root with the following:

   ```env
   DATABASE_URL=mysql://root:password@127.0.0.1:3306/salesduo
   OPENAI_API_KEY=sk-<your-key>
   PORT=3000
   ```

3. **Apply schema and start the server**:

   ```powershell
   npm run db:push   # Apply schema to the database
   npm run dev       # Start the development server
   ```

## Notes

- Ensure the `.env` file is not committed to version control.
- Use `npm run db:push` to sync schema changes with the database.