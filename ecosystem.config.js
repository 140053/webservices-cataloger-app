module.exports = {
  apps: [
    {
      name: "cataloger-app",
      script: "pnpm",
      args: "start",
      cwd: "D:\\code\\next\\Library-Manager-2026\\webservices\\cataloger-app",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        JWT_SECRET: "FOqDtFjZ&-=#0)Zfs#(@,BuW=nlk&MS[!xXmcAEy3-c",
        NODE_ENV_BACKEND_API: "http://10.2.42.18:8001",
        NEXT_PUBLIC_BACKEND_API: "http://10.2.42.18:8001",
      },
    },
  ],
};
