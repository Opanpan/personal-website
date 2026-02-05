#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="ifan.kinderheim511.com"
EMAIL="your@email.com"

echo -e "${YELLOW}=== Let's Encrypt SSL Certificate Initialization ===${NC}\n"

# Check if .env exists and source it
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
    DOMAIN=${DOMAIN:-ifan.kinderheim511.com}
    EMAIL=${EMAIL:-your@email.com}
fi

# Validate inputs
if [ "$EMAIL" = "your@email.com" ]; then
    echo -e "${RED}Error: Please update EMAIL in .env file before running this script${NC}"
    exit 1
fi

# Create directories for certbot
mkdir -p ./certbot-conf ./certbot-www

# Check if certificate already exists
if [ -d "./certbot-conf/live/$DOMAIN" ]; then
    echo -e "${YELLOW}Certificate for $DOMAIN already exists. Skipping initialization.${NC}"
    exit 0
fi

echo -e "${YELLOW}Step 1: Starting nginx container with dummy certificate...${NC}\n"

# Start only nginx with a dummy certificate to allow ACME challenge
docker-compose -f docker-compose.yml up -d nginx 2>/dev/null || {
    echo -e "${RED}Error: Could not start nginx container${NC}"
    exit 1
}

echo -e "${GREEN}✓ Nginx started${NC}\n"

# Wait for nginx to be ready
echo -e "${YELLOW}Waiting for nginx to be ready...${NC}"
sleep 5

echo -e "${YELLOW}Step 2: Requesting real SSL certificate from Let's Encrypt...${NC}\n"

# Run certbot to get real certificate
docker run --rm \
    -v "$(pwd)/certbot-conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot-www:/var/www/certbot" \
    -p 80:80 \
    certbot/certbot:latest certonly \
    --webroot -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --prefer-challenges=http

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ SSL certificate successfully obtained!${NC}\n"
else
    echo -e "\n${RED}Error: Failed to obtain SSL certificate${NC}"
    echo -e "${RED}Possible causes:${NC}"
    echo -e "  1. Domain is not pointing to your VPS IP"
    echo -e "  2. Port 80 is not accessible from the internet"
    echo -e "  3. DNS has not propagated yet (try waiting 5-30 minutes)"
    exit 1
fi

echo -e "${YELLOW}Step 3: Reloading nginx with SSL certificate...${NC}\n"

# Reload nginx to use the real certificate
docker-compose -f docker-compose.yml exec -T nginx nginx -s reload

echo -e "${GREEN}✓ Nginx reloaded with SSL certificate${NC}\n"

echo -e "${YELLOW}Step 4: Starting full production stack...${NC}\n"

# Start the full production stack
docker-compose --profile production up -d

sleep 3

echo -e "${GREEN}✓ Production stack started${NC}\n"

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}\n"

if docker-compose ps | grep -q "portfolio.*running"; then
    echo -e "${GREEN}✓ Portfolio service is running${NC}"
else
    echo -e "${RED}✗ Portfolio service is not running${NC}"
fi

if docker-compose ps | grep -q "nginx.*running"; then
    echo -e "${GREEN}✓ Nginx service is running${NC}"
else
    echo -e "${RED}✗ Nginx service is not running${NC}"
fi

if docker-compose ps | grep -q "certbot.*running"; then
    echo -e "${GREEN}✓ Certbot service is running${NC}"
else
    echo -e "${RED}✗ Certbot service is not running${NC}"
fi

echo -e "\n${GREEN}=== Initialization Complete ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Visit https://$DOMAIN to verify the certificate"
echo -e "  2. Check logs: docker-compose logs -f"
echo -e "  3. Monitor certificate renewal: docker-compose exec certbot certbot certificates"
echo -e "\n${YELLOW}Your website should be live at https://$DOMAIN${NC}\n"
