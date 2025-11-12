# 🚀 PM2 Usage Guide

## What is PM2?

PM2 is a production process manager for Node.js applications. It keeps your app running 24/7, automatically restarts on crashes, and provides load balancing across CPU cores.

---

## 📦 Installation

### Install PM2 Globally (One-time setup)

```bash
npm install -g pm2
```

### Verify Installation

```bash
pm2 --version
```

---

## 🎯 Basic Commands

### Start Application (Development)

```bash
npm run pm2:start
```

**What happens:**
- PM2 reads `ecosystem.config.cjs`
- Creates 12 instances (one per CPU core)
- Starts load balancing
- Your app runs on http://localhost:5000

### Start Application (Production)

```bash
npm run pm2:start:prod
```

**Difference from development:**
- Sets `NODE_ENV=production`
- Optimized for performance
- Less verbose logging

### Stop Application

```bash
npm run pm2:stop
```

**What happens:**
- Gracefully stops all instances
- Closes database connections
- Saves any pending data
- Processes stay in PM2 list (can be restarted)

### Restart Application

```bash
npm run pm2:restart
```

**What happens:**
- Stops all instances
- Starts them again
- **Downtime:** ~2-3 seconds

**Use when:**
- Code changes deployed
- Configuration changes
- Memory issues

### Reload Application (Zero-downtime)

```bash
npm run pm2:reload
```

**What happens:**
- Restarts instances one by one
- Always keeps some instances running
- **Downtime:** 0 seconds!

**Use when:**
- Production deployments
- Can't afford downtime

### Delete Application

```bash
npm run pm2:delete
```

**What happens:**
- Stops all instances
- Removes from PM2 list
- Clears all PM2 data

**Use when:**
- Completely removing app from PM2
- Starting fresh

---

## 📊 Monitoring Commands

### View Status

```bash
npm run pm2:status
```

**Output:**
```
┌─────┬──────────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name                 │ mode    │ ↺      │ status   │ cpu    │
├─────┼──────────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ chainverdict-api     │ cluster │ 0       │ online   │ 2%     │
│ 1   │ chainverdict-api     │ cluster │ 0       │ online   │ 3%     │
│ 2   │ chainverdict-api     │ cluster │ 0       │ online   │ 1%     │
│ 3   │ chainverdict-api     │ cluster │ 0       │ online   │ 2%     │
└─────┴──────────────────────┴─────────┴─────────┴──────────┴────────┘
```

**Columns explained:**
- **id:** Instance number (0, 1, 2, 3...)
- **name:** App name from ecosystem.config.cjs
- **mode:** cluster or fork
- **↺:** Restart count
- **status:** online, stopped, errored
- **cpu:** CPU usage per instance

### View Logs (Real-time)

```bash
npm run pm2:logs
```

**Output:**
```
0|chainverdict-api | Server running in development mode on port 5000
1|chainverdict-api | MongoDB Connected
2|chainverdict-api | Socket.io server ready
```

**Press Ctrl+C to exit**

### View Error Logs Only

```bash
npm run pm2:logs:error
```

**Shows only:**
- console.error() output
- Uncaught exceptions
- Database errors
- API errors

### Clear Logs

```bash
npm run pm2:flush
```

**What happens:**
- Deletes all log files
- Starts fresh logging

**Use when:**
- Log files too large
- Need clean logs for debugging

### Monitor (Dashboard)

```bash
npm run pm2:monit
```

**Shows:**
- Real-time CPU usage
- Real-time memory usage
- Live logs
- Process list

**Interactive dashboard - Press Ctrl+C to exit**

---

## 🔍 Advanced Commands

### View Detailed Info

```bash
pm2 show chainverdict-api
```

**Shows:**
- Uptime
- Restart count
- Memory usage
- CPU usage
- Environment variables
- Log file paths

### View All Processes

```bash
npm run pm2:list
```

**Shows all PM2 processes (not just chainverdict-api)**

### Save PM2 Configuration

```bash
pm2 save
```

**What happens:**
- Saves current PM2 process list
- Auto-starts on server reboot

**Use when:**
- Setting up production server
- Want auto-start on reboot

### Setup Auto-start on Reboot

```bash
pm2 startup
```

**What happens:**
- PM2 generates a startup script
- Copy and run the command it shows
- PM2 will auto-start on server reboot

**Example output:**
```
[PM2] You have to run this command as root. Execute the following command:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 🎨 Common Workflows

### Development Workflow

```bash
# Start with nodemon (auto-restart on file changes)
npm run dev

# When ready to test PM2:
npm run pm2:start
npm run pm2:monit  # Monitor in real-time
npm run pm2:stop   # Stop when done
```

### Production Deployment Workflow

```bash
# First time setup
npm run pm2:start:prod
pm2 save
pm2 startup  # Follow instructions

# Future deployments
git pull
npm install
npm run pm2:reload  # Zero-downtime restart
```

### Debugging Workflow

```bash
# Check if app is running
npm run pm2:status

# View logs
npm run pm2:logs

# View only errors
npm run pm2:logs:error

# Restart if needed
npm run pm2:restart
```

---

## 🚨 Troubleshooting

### Problem: PM2 not found

**Error:**
```
'pm2' is not recognized as an internal or external command
```

**Solution:**
```bash
npm install -g pm2
```

### Problem: App keeps restarting

**Check logs:**
```bash
npm run pm2:logs:error
```

**Common causes:**
- MongoDB connection failed
- Port already in use
- Missing environment variables
- Syntax error in code

### Problem: High memory usage

**Check memory:**
```bash
pm2 show chainverdict-api
```

**Solution:**
- Lower `max_memory_restart` in ecosystem.config.cjs
- Fix memory leaks in code
- Reduce number of instances

### Problem: Can't stop PM2

**Force stop:**
```bash
pm2 kill
```

**Warning:** This stops ALL PM2 processes!

---

## 📈 Performance Tips

### 1. Monitor Memory Usage

```bash
pm2 monit
```

Watch for memory leaks (constantly increasing memory).

### 2. Check Restart Count

```bash
pm2 status
```

If restart count is high, investigate logs.

### 3. Use Reload Instead of Restart

```bash
npm run pm2:reload  # Zero downtime
```

Instead of:
```bash
npm run pm2:restart  # 2-3 seconds downtime
```

### 4. Set Memory Limits

In `ecosystem.config.cjs`:
```javascript
max_memory_restart: '500M'  // Restart if >500MB
```

---

## 🎯 Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run pm2:start` | Start app (development) |
| `npm run pm2:start:prod` | Start app (production) |
| `npm run pm2:stop` | Stop app |
| `npm run pm2:restart` | Restart app (with downtime) |
| `npm run pm2:reload` | Restart app (zero downtime) |
| `npm run pm2:delete` | Remove app from PM2 |
| `npm run pm2:logs` | View logs (real-time) |
| `npm run pm2:logs:error` | View error logs only |
| `npm run pm2:flush` | Clear all logs |
| `npm run pm2:monit` | Monitor dashboard |
| `npm run pm2:status` | View status |
| `pm2 save` | Save PM2 config |
| `pm2 startup` | Setup auto-start |

---

## 🌟 Benefits of PM2

✅ **Auto-restart on crash** - Never worry about downtime  
✅ **Load balancing** - Use all CPU cores (12x performance!)  
✅ **Zero-downtime deployments** - Update without stopping  
✅ **Process monitoring** - Real-time CPU/memory tracking  
✅ **Log management** - Centralized logging  
✅ **Cluster mode** - Multiple instances automatically  

---

## 📚 Learn More

- Official Docs: https://pm2.keymetrics.io/docs/usage/quick-start/
- PM2 Plus (Monitoring): https://pm2.io/
- GitHub: https://github.com/Unitech/pm2

---

**Happy Clustering! 🚀**
