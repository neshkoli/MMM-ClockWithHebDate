#!/usr/bin/env node

import { Octokit } from "@octokit/rest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN is not set. Please create a .env file with your GitHub token.");
  console.error("Copy .env.example to .env and add your token.");
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function createAndUploadProject() {
  try {
    console.log("🚀 Setting up MMM-ClockWithHebDate repository...");

    // Get user info
    const userResponse = await octokit.users.getAuthenticated();
    const username = userResponse.data.login;
    console.log(`📝 Authenticated as: ${username}`);

    // Create repository
    console.log("📂 Creating repository...");
    const repoResponse = await octokit.repos.createForAuthenticatedUser({
      name: "MMM-ClockWithHebDate",
      description: "MagicMirror module to display current time, date, and Hebrew date",
      private: false,
      auto_init: false,
    });

    console.log(`✅ Repository created: ${repoResponse.data.html_url}`);

    // Get all files in the current directory
    const projectDir = process.cwd();
    const filesToUpload = [
      "MMM-ClockWithHebDate.js",
      "MMM-ClockWithHebDate.css",
      "node_helper.js",
      "package.json",
      "README.md",
      ".env.example",
      "mcp-github-server.js",
      "setup-github-repo.js"
    ];

    console.log("📤 Uploading files...");

    for (const file of filesToUpload) {
      const filePath = join(projectDir, file);
      
      try {
        const content = readFileSync(filePath, { encoding: "base64" });
        
        await octokit.repos.createOrUpdateFileContents({
          owner: username,
          repo: "MMM-ClockWithHebDate",
          path: file,
          message: `Add ${file}`,
          content,
        });

        console.log(`✅ Uploaded: ${file}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`⚠️  File not found (skipping): ${file}`);
        } else {
          console.error(`❌ Failed to upload ${file}: ${error.message}`);
        }
      }
    }

    // Create .gitignore
    console.log("📝 Creating .gitignore...");
    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: "MMM-ClockWithHebDate",
      path: ".gitignore",
      message: "Add .gitignore",
      content: Buffer.from(`node_modules/
.env
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*`).toString("base64"),
    });

    console.log("🎉 Project successfully uploaded to GitHub!");
    console.log(`🔗 Repository URL: ${repoResponse.data.html_url}`);
    console.log(`📥 Clone URL: ${repoResponse.data.clone_url}`);
    console.log("\n📋 Next steps:");
    console.log("1. Visit your repository on GitHub");
    console.log("2. Clone it locally if you want to continue development");
    console.log("3. Star the repository if you're proud of your work! ⭐");

  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.status === 422 && error.message.includes("already exists")) {
      console.log("\n💡 Repository already exists. You can:");
      console.log("1. Delete the existing repository from GitHub");
      console.log("2. Use a different name");
      console.log("3. Push to the existing repository manually");
    }
  }
}

createAndUploadProject();
