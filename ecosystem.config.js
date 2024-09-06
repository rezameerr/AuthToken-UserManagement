module.exports = {
  apps: [{
    name: "authtoken_wapi",
    script: "./index.js",
    watch: true,
    merge_logs: true,
    cwd: "/home/authtoken_wapi", // Change this line - it's for pm2
    env: {
      "NODE_ENV": "development"
    }
  }]
}