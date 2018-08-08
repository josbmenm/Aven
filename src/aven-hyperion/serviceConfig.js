const getServiceConfig = (service, deployId, serviceDir, moreEnv) => {
  const env = {
    ...(service.env || {}),
    ...moreEnv,
  };

  return `

[Unit]
Description=Globe Service ${deployId}
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=3
ExecStart=/usr/bin/node build/server.js
WorkingDirectory=${serviceDir}
Environment=GLOBE_APP=${service.appName}
${Object.keys(env || {})
    .map(envName => `Environment=${envName}=${env[envName]}`)
    .join('\n')}

[Install]
WantedBy=multi-user.target

`;
};

module.exports = getServiceConfig;
