#!/bin/bash
# Quick test script for the backend API

echo "🧪 Testing Sangam Backend API"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"

echo "1️⃣  Testing root endpoint..."
ROOT_RESPONSE=$(curl -s "$BASE_URL/")
if [[ $ROOT_RESPONSE == *"Sangam"* ]]; then
    echo -e "${GREEN}✅ Root endpoint works!${NC}"
    echo "   Response: $ROOT_RESPONSE"
else
    echo -e "${RED}❌ Root endpoint failed${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Creating test user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123"}')

if [[ $SIGNUP_RESPONSE == *"id"* ]] || [[ $SIGNUP_RESPONSE == *"already exists"* ]]; then
    echo -e "${GREEN}✅ User creation works!${NC}"
else
    echo -e "${YELLOW}⚠️  User might already exist (that's okay)${NC}"
fi

echo ""
echo "3️⃣  Logging in to get token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed. Make sure server is running and user exists.${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Login successful!${NC}"
    echo "   Token: ${TOKEN:0:20}..."
fi

echo ""
echo "4️⃣  Testing protected endpoint (GET /orders)..."
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/orders/" \
  -H "Authorization: Bearer $TOKEN")

if [[ $ORDERS_RESPONSE == *"[]"* ]] || [[ $ORDERS_RESPONSE == *"customer_name"* ]]; then
    echo -e "${GREEN}✅ Orders endpoint works!${NC}"
    echo "   Response: $ORDERS_RESPONSE"
else
    echo -e "${RED}❌ Orders endpoint failed${NC}"
    echo "   Response: $ORDERS_RESPONSE"
fi

echo ""
echo "5️⃣  Creating a test order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Customer",
    "product": "Test Product",
    "category": "Home Decor",
    "amount": 99.99,
    "payment_method": "Credit Card",
    "payment_status": "Paid",
    "delivery_status": "Pending",
    "source": "Website"
  }')

if [[ $ORDER_RESPONSE == *"order_id"* ]]; then
    echo -e "${GREEN}✅ Order creation works!${NC}"
    echo "   Response: $ORDER_RESPONSE"
else
    echo -e "${RED}❌ Order creation failed${NC}"
    echo "   Response: $ORDER_RESPONSE"
fi

echo ""
echo "=============================="
echo -e "${GREEN}✅ Basic tests complete!${NC}"
echo ""
echo "🌐 Open http://localhost:8000/docs for interactive testing"
