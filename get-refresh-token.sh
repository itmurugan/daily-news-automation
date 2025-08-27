#!/bin/bash

# Manual OAuth2 Refresh Token Generator
# Run this script and follow the instructions

echo "🔐 Gmail OAuth2 Refresh Token Generator"
echo "======================================"

# Check if CLIENT_ID and CLIENT_SECRET are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./get-refresh-token.sh CLIENT_ID CLIENT_SECRET"
    echo ""
    echo "Example:"
    echo "./get-refresh-token.sh 1234567890-abc123.apps.googleusercontent.com GOCSPX-abc123def456"
    exit 1
fi

CLIENT_ID="$1"
CLIENT_SECRET="$2"
REDIRECT_URI="http://localhost"
SCOPE="https://www.googleapis.com/auth/gmail.send"

echo ""
echo "Step 1: Open this URL in your browser:"
echo "======================================"
echo "https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code&access_type=offline&prompt=consent"
echo ""
echo "Step 2: After authorization, copy the authorization code"
echo "Step 3: Paste it here:"
read -p "Authorization code: " AUTH_CODE

echo ""
echo "Getting refresh token..."

# Exchange authorization code for refresh token
RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "code=${AUTH_CODE}" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=${REDIRECT_URI}")

# Extract refresh token from response
REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$REFRESH_TOKEN" ]; then
    echo ""
    echo "✅ Success! Your refresh token is:"
    echo "=================================="
    echo "$REFRESH_TOKEN"
    echo ""
    echo "Add this to your GitHub secrets as GMAIL_REFRESH_TOKEN"
else
    echo ""
    echo "❌ Error getting refresh token. Full response:"
    echo "$RESPONSE"
fi