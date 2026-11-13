// PM2 process file for the live server: pm2 start ecosystem.config.cjs
// The app listens on 127.0.0.1:3113 only; Nginx serves it publicly over HTTPS.
module.exports = {
  apps: [
    {
      name: "medialinkers",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3113 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      time: true,
    },
  ],
};
