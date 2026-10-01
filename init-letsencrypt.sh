#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Portfolio Production Deployment ===${NC}\n"

if [ ! -f .env ]; then
    echo -e "${RED}Error: .env not found. Create one with DOMAIN and EMAIL set.${NC}"
    exit 1
fi

export $(cat .env | grep -v '#' | xargs)

DOMAIN=${DOMAIN:-ifan.alriansyah.my.id}
EMAIL=${EMAIL:-fanalriansyah@gmail.com}

if [ -z "$EMAIL" ] || [ "$EMAIL" = "your@email.com" ]; then
    echo -e "${RED}Error: Set a valid EMAIL in .env${NC}"
    exit 1
fi

echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo -e "Email:  ${GREEN}$EMAIL${NC}\n"

# Step 1: Start shared proxy if not running
if ! docker ps --format '{{.Names}}' | grep -q '^nginx-proxy$'; then
    echo -e "${YELLOW}Starting shared reverse proxy...${NC}\n"
    cp .env proxy-network/.env 2>/dev/null || true
    docker compose -f proxy-network/docker-compose.yml up -d
    sleep 3
    echo -e "${GREEN}✓ Reverse proxy started${NC}\n"
else
    echo -e "${GREEN}✓ nginx-proxy is running${NC}\n"
fi

if ! docker ps --format '{{.Names}}' | grep -q '^acme-companion$'; then
    echo -e "${RED}Error: acme-companion is not running. SSL certificates won't be issued.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ acme-companion is running${NC}\n"
fi

# Step 2: Deploy portfolio (acme-companion handles SSL automatically via LETSENCRYPT_HOST)
echo -e "${YELLOW}Deploying portfolio service...${NC}\n"

docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Portfolio deployed successfully!${NC}\n"
    echo -e "${YELLOW}SSL certificate will be issued automatically by acme-companion.${NC}"
    echo -e "${YELLOW}Check progress with: docker logs acme-companion -f${NC}\n"
    echo -e "${YELLOW}Your website will be live at https://$DOMAIN once the cert is ready.${NC}\n"
else
    echo -e "\n${RED}Error: Deployment failed. Check logs with: docker compose logs${NC}"
    exit 1
fi
