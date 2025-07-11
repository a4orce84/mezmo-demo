#!/bin/bash

# Set your backend URL here
BACKEND_URL="https://mezmo-plkw4.ondigitalocean.app"

# Number of times to hit each endpoint
COUNT=5

for i in $(seq 1 $COUNT)
do
  echo "[$i] GET /api/products"
  curl -s -o /dev/null -w "%{http_code}\n" "$BACKEND_URL/api/products"

  echo "[$i] GET /api/cart"
  curl -s -o /dev/null -w "%{http_code}\n" "$BACKEND_URL/api/cart"

  echo "[$i] POST /api/cart"
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BACKEND_URL/api/cart" \
    -H "Content-Type: application/json" \
    -d '{"product_id":1,"quantity":1}'

  echo "[$i] DELETE /api/cart/1"
  curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$BACKEND_URL/api/cart/1"

  echo "[$i] POST /api/checkout"
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BACKEND_URL/api/checkout"

  echo "---"
done

echo "Done. Replace <YOUR_BACKEND_URL> with your actual backend URL before running."
