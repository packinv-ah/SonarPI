const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Class for monitoring file hashes and tracking changes in a project directory
class HashMonitor {
  constructor(projectPath = "./", trackingPath = "./.hash-tracking") {
    this.projectPath = path.resolve(projectPath);
    this.trackingPath = path.resolve(trackingPath);
    this.baselineFile = path.join(this.trackingPath, "baseline-hashes.json");
    this.masterHashFile = path.join(this.trackingPath, "master-hash.json");
    this.changedFilesDir = path.join(this.trackingPath, "changed-files");

    this.ignorePatterns = [
      ".hash-tracking",
      ".DS_Store",
      "README.md",
      "*.log",
      "dist",
      "build",
    ];

    this.initializeTracking();
  }

  // Initializes tracking directories if not present
  initializeTracking() {
    if (!fs.existsSync(this.trackingPath)) {
      fs.mkdirSync(this.trackingPath, { recursive: true });
    }
    if (!fs.existsSync(this.changedFilesDir)) {
      fs.mkdirSync(this.changedFilesDir, { recursive: true });
    }
  }

  // Sets directory and files to read-only recursively
  setReadOnlyRecursively(directory) {
    const setReadOnly = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          setReadOnly(itemPath);
        } else {
          fs.chmodSync(itemPath, 0o444);
        }
      }
    };
    fs.chmodSync(directory, 0o555);
    setReadOnly(directory);
  }

  // Sets directory and files to writable recursively
  setWritableRecursively(directory) {
    const setWritable = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          setWritable(itemPath);
        } else {
          fs.chmodSync(itemPath, 0o644);
        }
      }
    };
    fs.chmodSync(directory, 0o755);
    setWritable(directory);
  }

  // Locks the tracking directory (read-only)
  lock() {
    try {
      this.setReadOnlyRecursively(this.trackingPath);
      console.log(`🔒 .hash-tracking directory set to read-only mode.`);
    } catch (error) {
      console.warn(
        `Warning: Could not set .hash-tracking read-only: ${error.message}`
      );
    }
  }

  // Unlocks the tracking directory (writable)
  unlock() {
    try {
      this.setWritableRecursively(this.trackingPath);
      console.log(`✅ .hash-tracking directory set to writable mode.`);
    } catch (error) {
      console.warn(
        `Warning: Could not set .hash-tracking writable: ${error.message}`
      );
    }
  }

  // Checks if a file should be ignored based on patterns
  shouldIgnore(filePath) {
    const relativePath = path.relative(this.projectPath, filePath);
    return this.ignorePatterns.some((pattern) => {
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace("*", ".*"));
        return regex.test(relativePath);
      }
      return relativePath.includes(pattern);
    });
  }

  // Generates SHA256 hash for a file
  generateFileHash(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash("sha256").update(fileBuffer).digest("hex");
    } catch (error) {
      console.warn(
        `Warning: Could not read file ${filePath}: ${error.message}`
      );
      return null;
    }
  }

  // Recursively gets all files in the project directory, ignoring specified patterns
  getAllFiles(dirPath = this.projectPath) {
    let files = [];
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (this.shouldIgnore(fullPath)) {
          continue;
        }
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          files = files.concat(this.getAllFiles(fullPath));
        } else if (stat.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not read directory ${dirPath}: ${error.message}`
      );
    }
    return files;
  }

  // Generates hashes for all files in the project
  generateAllFileHashes() {
    const files = this.getAllFiles();
    const fileHashes = {};
    console.log(`Scanning ${files.length} files...`);
    for (const file of files) {
      const relativePath = path.relative(this.projectPath, file);
      const hash = this.generateFileHash(file);
      if (hash) {
        fileHashes[relativePath] = {
          hash: hash,
          lastModified: fs.statSync(file).mtime.toISOString(),
          size: fs.statSync(file).size,
        };
      }
    }
    return fileHashes;
  }

  // Generates a master hash from all file hashes
  generateMasterHash(fileHashes) {
    const sortedFiles = Object.keys(fileHashes).sort();
    const combinedHash = sortedFiles
      .map((file) => `${file}:${fileHashes[file].hash}`)
      .join("|");
    return crypto.createHash("sha256").update(combinedHash).digest("hex");
  }

  // Loads baseline file hashes from disk
  loadBaselineHashes() {
    try {
      if (fs.existsSync(this.baselineFile)) {
        return JSON.parse(fs.readFileSync(this.baselineFile, "utf8"));
      }
    } catch (error) {
      console.warn(`Warning: Could not load baseline hashes: ${error.message}`);
    }
    return {};
  }

  // Saves baseline file hashes to disk
  saveBaselineHashes(fileHashes) {
    fs.writeFileSync(this.baselineFile, JSON.stringify(fileHashes, null, 2));
  }

  // Loads the master hash from disk
  loadMasterHash() {
    try {
      if (fs.existsSync(this.masterHashFile)) {
        return JSON.parse(fs.readFileSync(this.masterHashFile, "utf8"));
      }
    } catch (error) {
      console.warn(`Warning: Could not load master hash: ${error.message}`);
    }
    return null;
  }

  // Saves the master hash to disk
  saveMasterHash(masterHash, timestamp) {
    const hashData = {
      hash: masterHash,
      timestamp: timestamp,
      totalFiles: Object.keys(this.loadBaselineHashes()).length,
    };
    fs.writeFileSync(this.masterHashFile, JSON.stringify(hashData, null, 2));
  }

  // Saves details of changed files to disk
  saveChangedFiles(changedFiles, timestamp, currentHashes, masterHash) {
    const changeData = {
      timestamp: timestamp,
      totalChangedFiles:
        Object.keys(changedFiles.modified).length +
        Object.keys(changedFiles.added).length +
        Object.keys(changedFiles.deleted).length,
      projectHash: masterHash,
      changes: {
        modified: changedFiles.modified,
        added: changedFiles.added,
        deleted: changedFiles.deleted,
        unchanged: Object.fromEntries(
          Object.entries(currentHashes).filter(
            ([file]) =>
              !changedFiles.modified[file] &&
              !changedFiles.added[file] &&
              !changedFiles.deleted[file]
          )
        ),
      },
    };
    const fileName = `changes-${timestamp.replace(/[:.]/g, "-")}.json`;
    const filePath = path.join(this.changedFilesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(changeData, null, 2));
    console.log(`📁 Changes saved to: ${fileName}`);
  }

  // Detects modified, added, and deleted files between current and baseline hashes
  detectChanges(currentHashes, baselineHashes) {
    const changes = {
      modified: {},
      added: {},
      deleted: {},
    };
    for (const [file, data] of Object.entries(currentHashes)) {
      if (baselineHashes[file]) {
        if (baselineHashes[file].hash !== data.hash) {
          changes.modified[file] = {
            oldHash: baselineHashes[file].hash,
            newHash: data.hash,
            oldModified: baselineHashes[file].lastModified,
            newModified: data.lastModified,
            size: data.size,
          };
        }
      } else {
        changes.added[file] = {
          hash: data.hash,
          lastModified: data.lastModified,
          size: data.size,
        };
      }
    }
    for (const [file, data] of Object.entries(baselineHashes)) {
      if (!currentHashes[file]) {
        changes.deleted[file] = {
          hash: data.hash,
          lastModified: data.lastModified,
          size: data.size,
        };
      }
    }
    return changes;
  }

  // Performs initial scan and saves baseline and master hash
  initializeScan() {
    console.log("🔍 Performing initial scan...");
    console.log(`📂 Scanning project: ${this.projectPath}`);
    const fileHashes = this.generateAllFileHashes();
    const masterHash = this.generateMasterHash(fileHashes);
    const timestamp = new Date().toISOString();

    this.saveBaselineHashes(fileHashes);
    this.saveMasterHash(masterHash, timestamp);

    console.log(`✅ Initial scan complete!`);
    console.log(`📊 Total files: ${Object.keys(fileHashes).length}`);
    console.log(`🔑 Master hash: ${masterHash}`);
    console.log(`📅 Timestamp: ${timestamp}`);

    return { fileHashes, masterHash, timestamp };
  }

  // Scans for changes since last baseline and updates tracking files
  scanForChanges() {
    console.log("🔍 Scanning for changes...");
    const currentHashes = this.generateAllFileHashes();
    const baselineHashes = this.loadBaselineHashes();
    const previousMasterHash = this.loadMasterHash();

    if (Object.keys(baselineHashes).length === 0) {
      console.log("❌ No baseline found. Run initialize first.");
      return null;
    }

    const changes = this.detectChanges(currentHashes, baselineHashes);
    const currentMasterHash = this.generateMasterHash(currentHashes);
    const timestamp = new Date().toISOString();

    const hasChanges =
      Object.keys(changes.modified).length > 0 ||
      Object.keys(changes.added).length > 0 ||
      Object.keys(changes.deleted).length > 0;

    if (hasChanges) {
      console.log("📝 Changes detected!");
      this.displayChanges(changes);
      this.saveChangedFiles(
        changes,
        timestamp,
        currentHashes,
        currentMasterHash
      );
      this.saveBaselineHashes(currentHashes);
      this.saveMasterHash(currentMasterHash, timestamp);
    } else {
      console.log("✅ No changes detected.");
    }

    return {
      changes,
      currentMasterHash,
      previousMasterHash,
      timestamp,
    };
  }

  // Displays changes in the console
  displayChanges(changes) {
    if (Object.keys(changes.modified).length > 0) {
      console.log("\n📝 Modified Files:");
      for (const [file, data] of Object.entries(changes.modified)) {
        console.log(`  • ${file}`);
        console.log(`    Old: ${data.oldHash.substring(0, 12)}...`);
        console.log(`    New: ${data.newHash.substring(0, 12)}...`);
      }
    }
    if (Object.keys(changes.added).length > 0) {
      console.log("\n➕ Added Files:");
      for (const [file, data] of Object.entries(changes.added)) {
        console.log(`  • ${file} (${data.hash.substring(0, 12)}...)`);
      }
    }
    if (Object.keys(changes.deleted).length > 0) {
      console.log("\n➖ Deleted Files:");
      for (const [file, data] of Object.entries(changes.deleted)) {
        console.log(`  • ${file} (was: ${data.hash.substring(0, 12)}...)`);
      }
    }
  }

  // Shows the current status of the project hash and recent changes
  getStatus() {
    const baselineHashes = this.loadBaselineHashes();
    const masterHashData = this.loadMasterHash();

    if (Object.keys(baselineHashes).length === 0) {
      console.log(
        '❌ Project not initialized. Run "node hash-monitor.js init" first.'
      );
      return;
    }

    console.log("📊 Project Hash Status:");
    console.log(`📂 Project path: ${this.projectPath}`);
    console.log(`📁 Tracking path: ${this.trackingPath}`);
    console.log(
      `📊 Total tracked files: ${Object.keys(baselineHashes).length}`
    );

    if (masterHashData) {
      console.log(`🔑 Current master hash: ${masterHashData.hash}`);
      console.log(`📅 Last update: ${masterHashData.timestamp}`);
    }

    const changeFiles = fs
      .readdirSync(this.changedFilesDir)
      .filter((file) => file.startsWith("changes-"))
      .sort()
      .reverse()
      .slice(0, 5);

    if (changeFiles.length > 0) {
      console.log("\n📝 Recent Changes:");
      changeFiles.forEach((file) => {
        const changeData = JSON.parse(
          fs.readFileSync(path.join(this.changedFilesDir, file), "utf8")
        );
        console.log(
          `  • ${changeData.timestamp}: ${changeData.totalChangedFiles} files changed`
        );
      });
    }
  }
}

// CLI entry point for hash-monitor commands
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const projectPath = args[1] || "./";
  const monitor = new HashMonitor(projectPath);

  switch (command) {
    case "init":
    case "initialize":
      monitor.initializeScan();
      break;

    case "scan":
    case "check":
      monitor.scanForChanges();
      break;

    case "status":
      monitor.getStatus();
      break;

    case "lock":
      monitor.lock();
      break;

    case "unlock":
      monitor.unlock();
      break;

    case "help":
      console.log(`
🔍 Hash Monitor - Codebase Integrity Tracker

Usage:
  node hash-monitor.js [command] [project-path]

Commands:
  init, initialize    - Perform initial scan and establish baseline
  scan, check        - Scan for changes since last baseline
  status             - Show current project hash status
  lock               - Make .hash-tracking read-only
  unlock             - Make .hash-tracking writable
  help               - Show this help message

Examples:
  node hash-monitor.js init           # Initialize current directory
  node hash-monitor.js scan           # Check for changes
  node hash-monitor.js status         # Show status
  node hash-monitor.js lock           # Make .hash-tracking read-only
  node hash-monitor.js unlock         # Make .hash-tracking writable
            `);
      break;

    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log(
        '💡 Tip: Run "node hash-monitor.js help" for usage information.'
      );
      console.log("💡 First time? Try: node hash-monitor.js init");
  }
}

module.exports = HashMonitor;

if (require.main === module) {
  main();
}
