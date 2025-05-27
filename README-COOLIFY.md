# Coolify v4 Deployment Setup

This project has been configured for deployment with Coolify v4 using a git-based approach. This README provides an overview of the configuration and related files, along with step-by-step instructions for setting up in the Coolify console.

## Configuration Files

- **nixpacks.toml**: Build configuration for Nixpacks buildpack
- **.env.production.example**: Template for production environment variables
- **.nvmrc**: Node.js version specification (v22)
- **next.config.ts**: Next.js configuration with optimization settings
- **scripts/env-check.sh**: Script to verify environment variables before starting
- **scripts/db-check.sh**: Script to verify database connection before starting

## Deployment Documentation

We've created several documentation files to help you understand and manage the Coolify deployment:

1. **COOLIFY-MIGRATION.md**: Overview of the migration from Vercel to Coolify
2. **COOLIFY-GIT-WORKFLOW.md**: Detailed guide for the git-based workflow
3. **COOLIFY-DEPLOYMENT-GUIDE.md**: Step-by-step instructions for deployment

## Git-Based vs Docker-Based Deployment

This project uses a git-based deployment approach with Nixpacks:

- **Git-based with Nixpacks**: Coolify pulls code from your repository, uses Nixpacks to build it with the right dependencies, and runs it directly.
- ~~Docker-based~~: (Alternative) Building a container image that would be run by Coolify.

Benefits of git-based deployment with Nixpacks:
- Simpler configuration
- Consistent and reproducible builds
- Automatic dependency management
- Faster deployments
- More direct control over the build and runtime environment
- Easier debugging

## Nixpacks Configuration

The `nixpacks.toml` file configures how your application is built and run:

```toml
[phases.setup]
nixPkgs = ["nodejs_22", "postgresql-client"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "./scripts/env-check.sh && ./scripts/db-check.sh && node .next/standalone/server.js"

[variables]
NODE_ENV = "production"
```

## Key Package.json Scripts

```json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "start:prod": "./scripts/env-check.sh && ./scripts/db-check.sh && node .next/standalone/server.js",
  "lint": "next lint",
  "analyze": "ANALYZE=true next build"
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

## Step-by-Step Coolify v4 Setup Guide

### 1. Initial Setup

1. Login to your Coolify dashboard
2. Go to "Sources" and add your Git repository
3. Click "New Resource" > "Application"
4. Select your repository from the list

### 2. Configure Application Settings

1. **Basic Configuration**
   - Name: `taufiqnajmi`
   - Description: `Photography blog and portfolio application`
   - Build Pack: `Nixpacks` (nixpacks.toml will be auto-detected)
   - Port: `3000`

2. **Domain Configuration**
   - Add Domain: `taufiqnajmizainal.89.28.236.78.sslip.io` (or your custom domain)
   - Check "Force HTTPS Redirect"
   - Check "Enable GZIP Compression"

3. **Health Check Configuration**
   - Enable Health Checks: ✅
   - Health Check Path: `/api/health`

4. **Network Configuration**
   - Connect To Docker Network: ✅

### 3. Set Up PostgreSQL Database

1. Click "New Resource" > "Database"
2. Select "PostgreSQL"
3. Configure PostgreSQL:
   - Name: `taufiqnajmi-db`
   - Version: `16`
   - Public Port: Enable if needed (e.g., for external admin tools)
   - Username/Password: Set secure credentials or use auto-generated

4. Link PostgreSQL to Your Application:
   - Go to your application settings
   - Navigate to "Environment Variables" section
   - Then set these environment variables in your app:
     ```
     POSTGRES_URL=postgresql://username:password@hostname:5432/database
     POSTGRES_URL_NON_POOLING=postgresql://username:password@hostname:5432/database
     ```

### 4. Configure Environment Variables

1. In your application settings, navigate to "Environment Variables"
2. Add Storage Configuration Variables:
   ```
   NEXT_PUBLIC_STORAGE_PREFERENCE=cloudflare-r2
   ```

3. Add any additional variables needed for your specific configuration:
   - Authentication variables (`AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`)
   - Storage provider credentials (Cloudflare R2 or AWS S3)
   - Site-specific variables

### 5. Deploy Your Application

1. Save all settings
2. Click "Deploy" to start the build and deployment process
3. Monitor the deployment logs for any issues

### 6. Verify Deployment

1. After deployment completes, check the application logs
2. Visit your domain and verify the site loads correctly
3. Test the admin login and photo upload functionality
4. Check the health endpoint: `https://yourdomain.com/api/health`

## Detailed PostgreSQL Setup Instructions

### Option 1: Using Coolify's Built-in PostgreSQL

Since Coolify v4 doesn't support automatic database setup via configuration files, you'll need to create and link the PostgreSQL resource manually:

1. Create PostgreSQL Resource:
   - Go to Dashboard > "New Resource" > "Database" > "PostgreSQL"
   - Configure the following settings:
     - Name: `taufiqnajmi-postgres` (or your preferred name)
     - Version: `16`
     - Public Port: Enable only if you need external access
     - Enable Health Checks: ✅
   - Click "Create" to create the PostgreSQL instance

2. Link PostgreSQL to Your Application:
   - Go to your application settings
   - Navigate to "Environment Variables" section
   - Click "Add Linked Resource"
   - Select your PostgreSQL database
   - Set the variable prefix to "POSTGRES"
   - This will create variables like `POSTGRES_URL`, `POSTGRES_HOST`, etc.

3. After deployment, the database connection will be checked:
   - The `db-check.sh` script validates the connection at startup
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
