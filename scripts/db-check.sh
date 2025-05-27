#!/bin/bash
# Database verification and initialization script for Coolify deployment

echo "🔍 Checking database connection and schema..."

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ ERROR: POSTGRES_URL environment variable is not set."
  echo "Please configure your PostgreSQL connection in Coolify environment variables."
  exit 1
fi

# Extract database connection details using a more robust approach with bash parameter substitution
# Strip the protocol prefix
URL_STRIPPED=${POSTGRES_URL#*://}

# Split auth part from host part (before/after @)
AUTH_PART=${URL_STRIPPED%%@*}  # everything before @
HOST_PART=${URL_STRIPPED#*@}   # everything after @

# Get username and password
DB_USER=${AUTH_PART%%:*}       # everything before :
DB_PASSWORD=${AUTH_PART#*:}     # everything after :

# Extract host and port
HOST_PORT=${HOST_PART%%/*}     # everything before /
DB_HOST=${HOST_PORT%%:*}       # everything before :
DB_PORT=${HOST_PORT#*:}        # everything after :

# Extract database name
DB_PATH=${HOST_PART#*/}        # everything after /
DB_NAME=${DB_PATH%%\?*}        # everything before ? (if exists)
# If we didn't find a ?, then use the entire path
if [[ "$DB_NAME" == "$DB_PATH" && "$DB_PATH" == *"?"* ]]; then
  DB_NAME=${DB_PATH}
fi

echo "📊 Database parameters:"
echo "   - Host: $DB_HOST"
echo "   - Port: $DB_PORT"
echo "   - Database: $DB_NAME"
echo "   - User: $DB_USER"

# Test database connection with pg_isready
if command -v pg_isready &> /dev/null; then
  if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
    echo "⚠️ WARNING: Could not parse host/port from POSTGRES_URL. Skipping connection test."
  else
    echo "🔄 Testing connection to PostgreSQL at $DB_HOST:$DB_PORT..."
    if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
      echo "✅ Database connection successful!"
    else
      echo "❌ ERROR: Could not connect to PostgreSQL database."
      echo "Please check your connection string and ensure the database is accessible from this server."
      exit 1
    fi
  fi
else
  echo "⚠️ WARNING: pg_isready not available. Using psql to test connection."
  
  # Use PGPASSWORD to avoid password prompt
  export PGPASSWORD="$DB_PASSWORD"
  
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful using psql!"
  else
    echo "❌ ERROR: Could not connect to PostgreSQL database using psql."
    echo "Please check your connection string and ensure the database is accessible from this server."
    exit 1
  fi
  
  # Clear the password from environment
  unset PGPASSWORD
fi

# Check and create basic schema if needed
echo "🔄 Checking database schema..."
export PGPASSWORD="$DB_PASSWORD"

# Check if photos table exists
table_exists=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'photos');" 2>/dev/null)

if [[ $table_exists == *"t"* ]]; then
  echo "✅ Database schema exists."
else
  echo "⚠️ Database schema not found. The application will create it on first run."
fi

# Clear the password from environment
unset PGPASSWORD

echo "🏁 Database checks complete. Database connection is ready for application."
exit 0
