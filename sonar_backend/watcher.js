const fs = require("fs");
const path = require("path");
const HashMonitor = require("./hash-monitor");

// Class to initiate watching files
class FileWatcher {
  constructor(projectPath = "./", debounceMs = 2000) {
    this.monitor = new HashMonitor(projectPath);
    this.debounceMs = debounceMs;
    this.watchTimeout = null;
    this.isScanning = false;
    this.watchers = new Map();

    console.log("🔍 File Watcher initialized");
    console.log(`📂 Watching: ${this.monitor.projectPath}`);
    console.log(`⏱️  Debounce delay: ${debounceMs}ms\n`);
  }

  // Debounced scan function
  debouncedScan() {
    if (this.watchTimeout) {
      clearTimeout(this.watchTimeout);
    }

    this.watchTimeout = setTimeout(() => {
      if (!this.isScanning) {
        this.performScan();
      }
    }, this.debounceMs);
  }

  // Perform the actual scan
  async performScan() {
    this.isScanning = true;
    console.log(
      `\n⏰ ${new Date().toLocaleTimeString()} - Scanning for changes...`
    );

    try {
      const result = this.monitor.scanForChanges();
      if (result && result.hasChanges) {
        console.log("🔄 Restarting file watchers due to structure changes...");
        this.restartWatchers();
      }
    } catch (error) {
      console.error("❌ Error during scan:", error.message);
    } finally {
      this.isScanning = false;
      console.log("⏳ Waiting for file changes...\n");
    }
  }

  // Setup file watchers recursively
  setupWatchers(dirPath = this.monitor.projectPath) {
    try {
      // Watch the directory itself
      if (!this.watchers.has(dirPath)) {
        const watcher = fs.watch(
          dirPath,
          { recursive: false },
          (eventType, filename) => {
            if (
              filename &&
              !this.monitor.shouldIgnore(path.join(dirPath, filename))
            ) {
              console.log(`📝 ${eventType}: ${path.join(dirPath, filename)}`);
              this.debouncedScan();
            }
          }
        );

        this.watchers.set(dirPath, watcher);
      }

      // Recursively watch subdirectories
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);

        if (this.monitor.shouldIgnore(fullPath)) {
          continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this.setupWatchers(fullPath);
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not watch directory ${dirPath}: ${error.message}`
      );
    }
  }

  // Restart all watchers
  restartWatchers() {
    this.stopWatchers();
    setTimeout(() => {
      this.setupWatchers();
      console.log("✅ File watchers restarted");
    }, 1000);
  }

  // Stop all watchers
  stopWatchers() {
    for (const [path, watcher] of this.watchers) {
      try {
        watcher.close();
      } catch (error) {
        console.warn(
          `Warning: Error closing watcher for ${path}:`,
          error.message
        );
      }
    }
    this.watchers.clear();
  }

  // Start watching
  async start() {
    // Check if project is initialized
    const baselineHashes = this.monitor.loadBaselineHashes();
    if (Object.keys(baselineHashes).length === 0) {
      console.log("❌ Project not initialized. Initializing now...");
      this.monitor.initializeScan();
      console.log("");
    }

    // Initial status check
    console.log("📊 Initial Status Check:");
    await this.performScan();

    // Setup file watchers
    console.log("🔧 Setting up file watchers...");
    this.setupWatchers();
    console.log("✅ File watchers active");
    console.log("⏳ Waiting for file changes...\n");

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down file watcher...");
      this.stopWatchers();
      if (this.watchTimeout) {
        clearTimeout(this.watchTimeout);
      }
      console.log("✅ File watcher stopped");
      process.exit(0);
    });

    // Keep the process alive
    console.log("Press Ctrl+C to stop watching\n");
  }

  // Show help
  static showHelp() {
    console.log(`
🔍 File Watcher - Real-time Hash Monitoring

Usage:
  node watcher.js [options]

Options:
  --path <path>     Project path to watch (default: current directory)
  --delay <ms>      Debounce delay in milliseconds (default: 2000)
  --help           Show this help message

Examples:
  node watcher.js                           # Watch current directory
  node watcher.js --path ../my-project      # Watch specific project
  node watcher.js --delay 5000              # Use 5 second delay
        `);
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let projectPath = "./";
  let debounceMs = 2000;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--path":
        projectPath = args[i + 1];
        i++;
        break;
      case "--delay":
        debounceMs = parseInt(args[i + 1]) || 2000;
        i++;
        break;
      case "--help":
      case "-h":
        FileWatcher.showHelp();
        return;
    }
  }

  // Start the watcher
  const watcher = new FileWatcher(projectPath, debounceMs);
  watcher.start().catch((error) => {
    console.error("❌ Error starting watcher:", error);
    process.exit(1);
  });
}

//testing

// Export for use as module
module.exports = FileWatcher;

// Run CLI if called directly
if (require.main === module) {
  main();
}
