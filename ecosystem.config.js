module.exports = {
  apps: [
    {
      name: 'sonerasflow',
      script: 'npm start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        MODE: 'production',
        NEXTAUTH_URL: 'http://soneras.local',
        NEXTAUTH_SECRET: 'YyG3BFojymCKIA0zGx3ekgK8oDL9fdumypp6ernEwuE=',
        DATABASE_URL:
          'postgres://soneras-server:12345@localhost:5432/sonerasflowdb'
      }
    }
  ]
}
