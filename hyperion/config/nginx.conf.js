const SSLConfig = ({ clusterName }) => `

server {

	# SSL configuration
	listen 443 ssl default_server;
	listen [::]:443 ssl default_server;
	ssl_certificate     /etc/letsencrypt/live/${clusterName}.aven.cloud/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/${clusterName}.aven.cloud/privkey.pem;
	
	server_name ${clusterName}.aven.cloud;

	location / {
		proxy_pass http://127.0.0.1:8080;
		proxy_set_header X-Forwarded-Proto https;
	}

}

`;

module.exports = ({ clusterName, hasSSL }) => `

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
	worker_connections 768;
	# multi_accept on;
}

http {

	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;
	# server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	##
	# Gzip Settings
	##

	gzip on;
	gzip_disable "msie6";

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

	server {
		listen 80 default_server;
		listen [::]:80 default_server;

		location ^~ /.well-known/acme-challenge/ {
			proxy-pass 
		}
	}
	
	${SSLConfig({ clusterName })}
}

`;
