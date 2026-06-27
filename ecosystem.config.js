module.exports = {
  apps: [
    {
      name: "mediconnect-backend",
      script: "./server/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
}
