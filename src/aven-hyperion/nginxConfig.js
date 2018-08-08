const serviceHostConfig = ({ hostName, serviceDir }) => `

server {

	listen 443 ssl;
	listen [::]:443 ssl;
	ssl_certificate     /etc/letsencrypt/live/${hostName}/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/${hostName}/privkey.pem;
	
	server_name ${hostName};

	location / {
		proxy_http_version 1.1;
		proxy_pass http://unix:${serviceDir}:;
		proxy_set_header X-Forwarded-Proto https;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-Ssl on;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection $connection_upgrade;
	}

}

`;

const clustersConfig = ({ props, state, clusterName }) => {
  const clusters = props.clusters;
  const cluster = clusters[clusterName];

  let hosts = [
    {
      hostName: `${clusterName}.aven.cloud`,
      serviceDir: cluster.mainService,
    },
  ];

  for (let serviceName in cluster.services) {
    const service = cluster.services[serviceName];
		const serviceState = state.clusters[clusterName].services[serviceName];
		const allDeployIds = Object.keys(serviceState.deploys);
    const deployId = allDeployIds[allDeployIds.length - 1]; // fix. this is always the last deploy
    const deploy = serviceState.deploys[deployId];
    hosts = [
      ...hosts,
      ...service.publicHosts.map(publicHost => ({
        hostName: publicHost,
        serviceDir: deploy.socketDir,
      })),
    ];
	}
	
  const hostsWithSSL = hosts.filter(h => {
    return state.ssl[clusterName][h.hostName].hasCert;
  });

  return hostsWithSSL
    .map(serviceHostConfig)
    .join('');
};

module.exports = ({ props, state, clusterName }) => `

user root;
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

	map $http_upgrade $connection_upgrade {
			default upgrade;
			'' close;
	}

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
			proxy_pass http://hyperion.aven.cloud;
		}
		location / {
			return 301 https://$http_host$request_uri;
		}
	}
	
	${clustersConfig({ props, state, clusterName })}
}

`;
