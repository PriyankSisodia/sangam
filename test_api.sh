#!/bin/bash
# Quick API Test Script

echo "🔍 Testing Sangam API..."
echo ""

# Check if backend is running
echo "1. Checking backend..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Start it with: cd sangam-backend && uvicorn main:app --reload"
    exit 1
fi

# Check if you have a token (you'll need to login first)
echo ""
echo "2. To test authenticated endpoints:"
echo "   a. Login at http://localhost:5173/login"
echo "   b. Open browser DevTools (F12)"
echo "   c. Go to Application → Local Storage"
echo "   d. Copy your 'token' value"
echo "   e. Run: TOKEN='your-token' bash test_api.sh"
echo ""

if [ -z "$TOKEN" ]; then
    echo "   ⚠️  No token provided. Skipping authenticated tests."
    echo "   Set TOKEN='your-token' and run again to test /chats/ and /orders/"
    exit 0
fi

echo "3. Testing authenticated endpoints with your token..."

# Test chats
echo ""
echo "   Testing GET /chats/..."
CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:8000/chats/)
HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)
CHAT_BODY=$(echo "$CHAT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    CHAT_COUNT=$(echo "$CHAT_BODY" | grep -o '"id"' | wc -l)
    echo "   ✅ Success! Found $CHAT_COUNT chats"
else
    echo "   ❌ Failed with HTTP $HTTP_CODE"
    echo "   Response: $CHAT_BODY"
fi

# Test orders
echo ""
echo "   Testing GET /orders/..."
ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:8000/orders/)
HTTP_CODE=$(echo "$ORDER_RESPONSE" | tail -n1)
ORDER_BODY=$(echo "$ORDER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    ORDER_COUNT=$(echo "$ORDER_BODY" | grep -o '"order_id"' | wc -l)
    echo "   ✅ Success! Found $ORDER_COUNT orders"
else
    echo "   ❌ Failed with HTTP $HTTP_CODE"
    echo "   Response: $ORDER_BODY"
fi

echo ""
echo "✅ Test complete!"
echo ""
echo "If you see errors:"
echo "1. Make sure you're logged in at http://localhost:5173/login"
echo "2. Check your token is valid (not expired)"
echo "3. Check backend logs for errors"

