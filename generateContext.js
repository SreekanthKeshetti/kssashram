const fs = require("fs");
const path = require("path");

// Configuration
const outputFile = "full_project_code.txt";
const foldersToInclude = ["server", "client/src"]; // We only care about source code
const extensionsToInclude = [".js", ".jsx", ".css", ".json"]; // File types to read
const filesToIgnore = ["package-lock.json", "vite.svg", "logo.png"]; // Specific files to skip

// Helper function to get all files recursively
const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Ignore node_modules, .git, dist, build, uploads
      if (
        !["node_modules", ".git", "dist", "build", "uploads"].includes(file)
      ) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // Check extension
      if (
        extensionsToInclude.includes(path.extname(file)) &&
        !filesToIgnore.includes(file)
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
};

// Main execution
try {
  let outputContent = "PROJECT CONTEXT FOR AI\n";
  outputContent += "======================\n\n";

  // 1. Add Root package.json (Important for scripts)
  if (fs.existsSync("package.json")) {
    outputContent += `--- FILE: package.json ---\n`;
    outputContent += fs.readFileSync("package.json", "utf8");
    outputContent += `\n\n`;
  }

  // 2. Loop through folders
  foldersToInclude.forEach((folder) => {
    if (fs.existsSync(folder)) {
      const files = getAllFiles(folder);

      files.forEach((filePath) => {
        // Create a readable header for each file
        outputContent += `--- FILE: ${filePath.replace(/\\/g, "/")} ---\n`;
        outputContent += fs.readFileSync(filePath, "utf8");
        outputContent += `\n\n`;
      });
    }
  });

  fs.writeFileSync(outputFile, outputContent);
  console.log(`✅ Success! All code has been saved to: ${outputFile}`);
  console.log(
    `📁 File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`
  );
  console.log("👉 You can now upload this file to a new AI chat.");
} catch (err) {
  console.error("Error generating context:", err);
}
