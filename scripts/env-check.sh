#!/bin/bash

# Script to verify environment variables before starting the application in Coolify

echo "Checking environment variables for Coolify deployment..."

# Required variables
REQUIRED_VARS=(
  "AUTH_SECRET"
  "ADMIN_EMAIL"
  "ADMIN_PASSWORD"
  "NEXT_PUBLIC_DOMAIN"
  "POSTGRES_URL"
  "POSTGRES_URL_NON_POOLING"
)

# Storage-specific variables
CLOUDFLARE_R2_VARS=(
  "NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET"
  "NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID"
  "NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN"
  "CLOUDFLARE_R2_ACCESS_KEY"
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY"
)

AWS_S3_VARS=(
  "NEXT_PUBLIC_AWS_S3_BUCKET"
  "NEXT_PUBLIC_AWS_S3_REGION"
  "AWS_S3_ACCESS_KEY"
  "AWS_S3_SECRET_ACCESS_KEY"
)

# Check for required variables
MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR}" ]]; then
    echo "❌ Missing required environment variable: $VAR"
    MISSING=$((MISSING+1))
  fi
done

# Check storage configuration
if [[ "$NEXT_PUBLIC_STORAGE_PREFERENCE" == "cloudflare-r2" ]]; then
  echo "Using Cloudflare R2 storage"
  for VAR in "${CLOUDFLARE_R2_VARS[@]}"; do
    if [[ -z "${!VAR}" ]]; then
      echo "❌ Missing required Cloudflare R2 variable: $VAR"
      MISSING=$((MISSING+1))
    fi
  done
elif [[ "$NEXT_PUBLIC_STORAGE_PREFERENCE" == "aws-s3" ]]; then
  echo "Using AWS S3 storage"
  for VAR in "${AWS_S3_VARS[@]}"; do
    if [[ -z "${!VAR}" ]]; then
      echo "❌ Missing required AWS S3 variable: $VAR"
      MISSING=$((MISSING+1))
    fi
  done
else
  echo "⚠️ Warning: NEXT_PUBLIC_STORAGE_PREFERENCE not set to 'cloudflare-r2' or 'aws-s3'"
  echo "    Default storage provider will be used"
fi

if [[ $MISSING -gt 0 ]]; then
  echo "❌ $MISSING environment variables missing. Please check your configuration."
  echo "   This may cause issues with your application."
else
  echo "✅ All required environment variables are set."
fi

echo "Starting application..."
