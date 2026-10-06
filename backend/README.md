# Ami Infracon — Backend

REST API for Ami Infracon LLP built with Express and MongoDB.

## Requirements

- **Node.js >= 20.6.0** — The `dev`, `start`, and `create-superadmin` scripts use the native `--env-file` flag introduced in Node.js 20.6.0. Running these scripts on an older version will fail with an "unrecognized flag" error.
- MongoDB (local or remote)

> Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions. A `.nvmrc` file is included — run `nvm use` in this directory to automatically switch to the correct version.

## Setup

1. Ensure the root `.env` file exists at `../` relative to this folder (see `.env` in the workspace root).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start server in watch mode (requires Node >= 20.6.0) |
| `npm start` | Start server in production mode (requires Node >= 20.6.0) |
| `npm run create-superadmin` | Seed the super-admin account (requires Node >= 20.6.0) |
