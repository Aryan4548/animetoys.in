/**
 * PM2 process configuration.
 *
 * Usage (from the app directory, /var/www/anime-toy-universe/app):
 *   pm2 start deploy/ecosystem.config.js
 *   pm2 save
 *   pm2 startup   (run the command it prints, once, as root)
 *
 * Next.js loads .env / .env.production itself (no need to pass env vars
 * through PM2), as long as this process's cwd is the app directory.
 */
module.exports = {
  apps: [
    {
      name: "anime-toy-universe",
      cwd: __dirname + "/..", // the Next.js app root (parent of /deploy)
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      instances: 1, // keep at 1 unless you also move rate limiting to a shared store (see README)
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "15s",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/anime-toy-universe/pm2-error.log",
      out_file: "/var/log/anime-toy-universe/pm2-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
