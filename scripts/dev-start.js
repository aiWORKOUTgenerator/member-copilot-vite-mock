#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const net = require('net');

const PORT = 5177;
const HOST = 'localhost';

// Check if port is in use
function checkPort(port, host = 'localhost') {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port is in use
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true); // Port is available
    });
    
    server.listen(port, host);
  });
}

// Kill process on port (cross-platform)
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows command
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = lines
            .map(line => line.trim().split(/\s+/))
            .filter(parts => parts.length >= 5)
            .map(parts => parts[4])
            .filter(pid => pid && pid !== '0');
          
          if (pids.length > 0) {
            exec(`taskkill /F /PID ${pids.join(' /PID ')}`, () => {
              console.log('✅ Existing process terminated');
              resolve();
            });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    } else {
      // Unix/Linux/Mac command
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          if (pids.length > 0) {
            exec(`kill -9 ${pids.join(' ')}`, () => {
              console.log('✅ Existing process terminated');
              resolve();
            });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }
  });
}

// Start dev server
function startDevServer() {
  console.log('🚀 Starting development server...');
  
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  devServer.on('error', (error) => {
    console.error('❌ Failed to start dev server:', error);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dev server...');
    devServer.kill('SIGINT');
    process.exit(0);
  });
}

// Main execution
async function main() {
  console.log(`🔍 Checking if dev server is already running on port ${PORT}...`);
  
  try {
    const isAvailable = await checkPort(PORT, HOST);
    
    if (!isAvailable) {
      console.log(`⚠️  Port ${PORT} is already in use. Stopping existing process...`);
      await killProcessOnPort(PORT);
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Double-check the port is now available
      const isNowAvailable = await checkPort(PORT, HOST);
      if (!isNowAvailable) {
        console.log('❌ Unable to free up the port. Please manually stop the process.');
        process.exit(1);
      }
    } else {
      console.log(`✅ Port ${PORT} is available`);
    }
    
    startDevServer();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 