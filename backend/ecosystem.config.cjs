/**
 * PM2 Ecosystem Configuration File
 * 
 * Purpose: Configure how PM2 runs your Node.js application
 * 
 * What is PM2?
 * - Production process manager for Node.js
 * - Keeps your app running 24/7
 * - Auto-restarts on crashes
 * - Load balances across CPU cores
 * 
 * What is Cluster Mode?
 * - Runs multiple instances of your app (one per CPU core)
 * - Distributes incoming requests across all instances
 * - If one instance crashes, others keep running
 * 
 * Example:
 * - Your server has 4 CPU cores
 * - PM2 creates 4 instances of your app
 * - Each instance handles requests independently
 * - Result: 4x more requests handled simultaneously!
 */

module.exports = {
  apps: [
    {
      // ============================================
      // BASIC CONFIGURATION
      // ============================================
      
      /**
       * name: Application name (shows in PM2 list)
       * This name is used in all PM2 commands:
       * - pm2 stop chainverdict-api
       * - pm2 restart chainverdict-api
       * - pm2 logs chainverdict-api
       */
      name: 'chainverdict-api',
      
      /**
       * script: Entry point of your application
       * This is the file PM2 will execute
       * Same as: node server.js
       */
      script: './server.js',
      
      // ============================================
      // CLUSTER MODE CONFIGURATION
      // ============================================
      
      /**
       * instances: Number of instances to run
       * 
       * Options:
       * - 'max': Use all CPU cores (RECOMMENDED)
       * - 2: Run exactly 2 instances
       * - -1: Use all cores minus 1
       * 
       * How it works:
       * - Local (12 cores) → 12 instances
       * - AWS t2.micro (1 core) → 1 instance
       * - AWS t3.medium (2 cores) → 2 instances
       * - AWS c5.xlarge (4 cores) → 4 instances
       * 
       * PM2 automatically detects CPU cores on ANY machine!
       */
      instances: 'max',
      
      /**
       * exec_mode: Execution mode
       * 
       * Options:
       * - 'cluster': Load balancing mode (RECOMMENDED for web servers)
       * - 'fork': Single instance mode (for background jobs)
       * 
       * Cluster mode benefits:
       * - Built-in load balancing
       * - Zero-downtime restarts
       * - Better CPU utilization
       */
      exec_mode: 'cluster',
      
      // ============================================
      // ENVIRONMENT VARIABLES
      // ============================================
      
      /**
       * env: Default environment variables
       * Used when running: pm2 start ecosystem.config.cjs
       */
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      
      /**
       * env_production: Production environment variables
       * Used when running: pm2 start ecosystem.config.cjs --env production
       */
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // ============================================
      // AUTO-RESTART CONFIGURATION
      // ============================================
      
      /**
       * watch: Watch files for changes and auto-restart
       * 
       * Options:
       * - false: Don't watch (RECOMMENDED for production)
       * - true: Watch all files
       * - ['server.js', 'routes']: Watch specific files/folders
       * 
       * Why false in production?
       * - File watching uses CPU/memory
       * - Use nodemon for development instead
       * - Production should be stable (no auto-restarts on file changes)
       */
      watch: false,
      
      /**
       * max_memory_restart: Restart if memory exceeds this limit
       * 
       * Why needed?
       * - Prevents memory leaks from crashing server
       * - If instance uses >500MB, PM2 restarts it gracefully
       * - Other instances keep running (zero downtime!)
       * 
       * Recommended values:
       * - Development: 500M
       * - Production (t3.small): 1G
       * - Production (t3.medium): 2G
       */
      max_memory_restart: '500M',
      
      /**
       * autorestart: Auto-restart on crash
       * 
       * Why true?
       * - If your app crashes, PM2 restarts it automatically
       * - No manual intervention needed
       * - Keeps your app running 24/7
       */
      autorestart: true,
      
      /**
       * max_restarts: Maximum restarts within 1 minute
       * 
       * Why needed?
       * - Prevents infinite restart loops
       * - If app crashes 10 times in 1 minute, PM2 stops trying
       * - Alerts you that something is seriously wrong
       */
      max_restarts: 10,
      
      /**
       * min_uptime: Minimum uptime before considering stable
       * 
       * Why needed?
       * - If app crashes within 10 seconds, it's not counted as "stable"
       * - Helps detect startup issues
       */
      min_uptime: '10s',
      
      // ============================================
      // LOGGING CONFIGURATION
      // ============================================
      
      /**
       * error_file: Path to error log file
       * All console.error() and uncaught errors go here
       */
      error_file: './logs/pm2-error.log',
      
      /**
       * out_file: Path to output log file
       * All console.log() output goes here
       */
      out_file: './logs/pm2-out.log',
      
      /**
       * log_date_format: Timestamp format for logs
       * Example: 2024-01-15 10:30:45 +0530
       */
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      /**
       * merge_logs: Merge logs from all instances
       * 
       * Why true?
       * - With 12 instances, you don't want 12 separate log files
       * - All logs go to same file with instance ID
       */
      merge_logs: true,
      
      // ============================================
      // GRACEFUL SHUTDOWN
      // ============================================
      
      /**
       * kill_timeout: Time to wait before force killing
       * 
       * How it works:
       * 1. PM2 sends SIGINT signal (graceful shutdown)
       * 2. Your app closes connections, saves data
       * 3. After 5 seconds, if still running, PM2 force kills (SIGKILL)
       */
      kill_timeout: 5000,
      
      /**
       * wait_ready: Wait for app to signal it's ready
       * 
       * Why true?
       * - Your app needs time to connect to MongoDB, Redis, etc.
       * - PM2 waits for app to be fully ready before routing traffic
       * 
       * How to use:
       * In your server.js, after everything is ready:
       * if (process.send) process.send('ready');
       */
      wait_ready: true,
      
      /**
       * listen_timeout: Max time to wait for app to be ready
       * 
       * Why 10 seconds?
       * - MongoDB connection takes 2-3 seconds
       * - Redis connection takes 1-2 seconds
       * - Total: ~5 seconds (10 seconds is safe buffer)
       */
      listen_timeout: 10000,
      
      // ============================================
      // ADVANCED SETTINGS
      // ============================================
      
      /**
       * instance_var: Environment variable name for instance ID
       * 
       * Usage in code:
       * console.log(`Instance ${process.env.NODE_APP_INSTANCE} started`);
       * 
       * Output:
       * Instance 0 started
       * Instance 1 started
       * Instance 2 started
       * ...
       */
      instance_var: 'NODE_APP_INSTANCE',
      
      /**
       * cron_restart: Restart at specific time (optional)
       * 
       * Example: '0 3 * * *' = Restart at 3 AM daily
       * Useful for clearing memory leaks in production
       * 
       * Commented out by default (not needed for most apps)
       */
      // cron_restart: '0 3 * * *',
      
      /**
       * ignore_watch: Files/folders to ignore when watching
       * Only relevant if watch: true
       */
      ignore_watch: ['node_modules', 'logs', '.git'],
    }
  ]
};
