# Coolify Deployment Setup

This project has been configured for deployment with Coolify using a git-based approach. This README provides an overview of the configuration and related files.

## Configuration Files

- **coolify.json**: Main configuration file for Coolify
- **.env.production.example**: Template for production environment variables
- **.nvmrc**: Node.js version specification (v22)
- **next.config.ts**: Next.js configuration with optimization settings
- **scripts/env-check.sh**: Script to verify environment variables before starting

## Deployment Documentation

We've created several documentation files to help you understand and manage the Coolify deployment:

1. **COOLIFY-MIGRATION.md**: Overview of the migration from Vercel to Coolify
2. **COOLIFY-GIT-WORKFLOW.md**: Detailed guide for the git-based workflow
3. **COOLIFY-DEPLOYMENT-GUIDE.md**: Step-by-step instructions for deployment

## Git-Based vs Docker-Based Deployment

This project now uses a git-based deployment approach rather than Docker:

- **Git-based**: Coolify pulls code from your repository, builds it on the server, and runs it directly.
- ~~Docker-based~~: (Previously) Built a container image that was then run by Coolify.

Benefits of git-based deployment:
- Simpler configuration
- Faster deployments
- More direct control over the build and runtime environment
- Easier debugging

## Key Package.json Scripts

```json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "start:prod": "./scripts/env-check.sh && next start",
  "lint": "next lint",
  "coolify:prestart": "npm run build",
  "coolify:prebuild": "echo 'Installing dependencies for Coolify deployment'"
}
```

## Database Configuration

### PostgreSQL Setup with Coolify

This application requires a PostgreSQL database. The `coolify.json` file is configured to automatically set up a PostgreSQL database with the necessary configuration when deployed with Coolify. Here are your options:

1. **Use Coolify's Built-in PostgreSQL Service (Recommended):**
   - The configuration in `coolify.json` will automatically create a PostgreSQL 16 resource
   - The database connection strings will be automatically injected as environment variables
   - No manual configuration is needed, but you can customize the settings in Coolify UI
   - Database health checks are enabled automatically

2. **Use an External PostgreSQL Database:**
   - If you prefer to use an external database, you can set up PostgreSQL on your server or use a managed service like DigitalOcean, AWS RDS, or Supabase
   - Configure the connection string in your application's environment variables manually
   - Disable the auto-created PostgreSQL resource in Coolify

### Database Connection Configuration

The application requires the following database environment variables which are automatically set when using Coolify's built-in PostgreSQL:

```
POSTGRES_URL=postgresql://username:password@hostname:5432/database
POSTGRES_URL_NON_POOLING=postgresql://username:password@hostname:5432/database
```

If you're using Supabase or another provider that requires SSL to be disabled:

```
DISABLE_POSTGRES_SSL=1
```

### Database Schema and Migration

The application includes an automatic database check script (`scripts/db-check.sh`) that:

1. Verifies the PostgreSQL connection before starting the application
2. Checks if the required database schema exists
3. Reports any database connectivity issues

The database schema will be automatically created during the first deployment. No manual migration steps are required.

### Database Health Monitoring

The application provides a health check endpoint at `/api/health` that reports the status of the application. This endpoint is used by Coolify to monitor the health of your application and database connection.

## Storage Configuration

This application supports multiple storage providers:
- AWS S3
- Cloudflare R2

The default is set to Cloudflare R2, but you can change it using the `NEXT_PUBLIC_STORAGE_PREFERENCE` environment variable.

## Environment Variables

Critical environment variables are listed in `.env.production.example`. Make sure to set these in your Coolify deployment.

## Quick Start

To deploy this application to Coolify:

1. Install Coolify on your server
2. Add this git repository as a source
3. Create a new application using this repository
4. **PostgreSQL will be automatically set up** by the configuration in `coolify.json`
5. Configure environment variables:
   - `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` will be automatically set
   - Configure storage (R2 or S3) variables
   - Set authentication variables (`AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`)
   - Configure site-specific variables
6. Deploy the application
7. Verify database setup in the logs during deployment

## Detailed PostgreSQL Setup Instructions

### Option 1: Using Coolify's Built-in PostgreSQL (Automatic Setup)

With the updated `coolify.json` configuration, PostgreSQL will be automatically set up:

1. When you deploy your application, Coolify will:
   - Create a PostgreSQL 16 database resource automatically
   - Generate secure credentials
   - Connect the database to your application
   - Inject the connection strings as environment variables (`POSTGRES_URL` and `POSTGRES_URL_NON_POOLING`)

2. After deployment, you can view and manage the database:
   - In the Coolify dashboard, click on "Resources" in the sidebar
   - Find your PostgreSQL database (named after your application)
   - Access connection details, logs, and administration options

3. The database will be automatically checked during application startup:
   - The `db-check.sh` script validates the connection
   - Any issues will be reported in the application logs

### Option 2: Using External PostgreSQL

If you're using an external PostgreSQL database:

1. Create a PostgreSQL database on your preferred provider
2. Create a dedicated user with appropriate permissions
3. Note the following details:
   - Host/hostname
   - Port (typically 5432)
   - Database name
   - Username
   - Password
4. Construct your connection string: `postgresql://username:password@hostname:5432/database`
5. When creating your application in Coolify, set:
   - `POSTGRES_URL` = your connection string
   - `POSTGRES_URL_NON_POOLING` = your connection string

### Testing the Database Connection

After deployment, verify the database connection by:
1. Logging into the admin section of your photo blog
2. Attempting to upload a photo
3. Checking the application logs for any database-related errors

If you encounter connection issues, double-check:
- The connection string format
- Network access (ensure Coolify can reach the database)
- User permissions
- If using Supabase, set `DISABLE_POSTGRES_SSL=1`
