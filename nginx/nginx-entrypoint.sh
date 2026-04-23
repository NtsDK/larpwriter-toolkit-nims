#!/bin/sh

echo "Generating nginx config..."

if [ "$SSL_ENABLED" = "true" ]; then

  echo "SSL ENABLED"

  export SSL_REDIRECT_BLOCK="return 301 https://\$host\$request_uri;"

  export HTTPS_BLOCK="
server {
    listen 443 ssl;
    server_name ${DOMAINS};

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://app:3001;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
"

else

  echo "SSL DISABLED"

  export SSL_REDIRECT_BLOCK=""
  export HTTPS_BLOCK=""

fi

envsubst '$DOMAINS $SSL_REDIRECT_BLOCK $HTTPS_BLOCK' \
< /etc/nginx/templates/nginx.conf.template \
> /etc/nginx/conf.d/default.conf

nginx -g "daemon off;"