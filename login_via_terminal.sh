#!/bin/bash
# Login via Terminal Script
# This helps you login with any email and get a token

echo "🔐 Login via Terminal"
echo "===================="
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/ > /dev/null; then
    echo "❌ Backend is not running!"
    echo "   Start it with: cd sangam-backend && uvicorn main:app --reload"
    exit 1
fi

# Get email and password
read -p "Enter your email: " EMAIL
read -sp "Enter your password: " PASSWORD
echo ""

# Login
echo ""
echo "🔑 Logging in..."
RESPONSE=$(curl -s -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

# Check if login was successful
if echo "$RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "✅ Login successful!"
    echo ""
    echo "Your access token:"
    echo "$TOKEN"
    echo ""
    echo "📋 To use this token:"
    echo "1. Copy the token above"
    echo "2. Use it in API calls:"
    echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost:8000/chats/"
    echo ""
    echo "3. Or use it in Swagger UI:"
    echo "   - Go to http://localhost:8000/docs"
    echo "   - Click 'Authorize'"
    echo "   - Paste the token"
    echo ""
    echo "4. Or save it to use in browser:"
    echo "   - Open browser DevTools (F12)"
    echo "   - Go to Console"
    echo "   - Run: localStorage.setItem('token', '$TOKEN')"
    echo "   - Refresh the page"
    echo ""
    
    # Save token to file for easy access
    echo "$TOKEN" > .token
    echo "💾 Token also saved to .token file"
    echo "   Use it with: TOKEN=\$(cat .token)"
else
    echo "❌ Login failed!"
    echo "Response: $RESPONSE"
    echo ""
    echo "Possible issues:"
    echo "1. Wrong email or password"
    echo "2. User doesn't exist - sign up first at http://localhost:5173/signup"
    exit 1
fi

