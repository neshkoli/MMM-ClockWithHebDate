#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function initializeProject() {
  console.log("🚀 Welcome to MMM-ClockWithHebDate GitHub Setup!");
  console.log("This script will help you set up your project on GitHub.\n");

  // Check if .env already exists
  if (existsSync('.env')) {
    console.log("✅ .env file already exists.");
    const proceed = await question("Do you want to continue with the existing configuration? (y/n): ");
    if (proceed.toLowerCase() !== 'y') {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }
  } else {
    console.log("📝 Let's set up your GitHub token...");
    console.log("\n🔑 To get a GitHub Personal Access Token:");
    console.log("1. Go to https://github.com/settings/tokens");
    console.log("2. Click 'Generate new token (classic)'");
    console.log("3. Select scopes: 'repo' and 'user'");
    console.log("4. Copy the generated token\n");

    const token = await question("Enter your GitHub token: ");
    
    if (!token || token.trim() === '') {
      console.log("❌ No token provided. Setup cancelled.");
      rl.close();
      return;
    }

    // Create .env file
    const envContent = `# GitHub MCP Server Configuration
GITHUB_TOKEN=${token.trim()}`;
    
    writeFileSync('.env', envContent);
    console.log("✅ .env file created successfully!");
  }

  console.log("\n📋 What would you like to do?");
  console.log("1. Create a new GitHub repository and upload all files");
  console.log("2. Just test the GitHub connection");
  console.log("3. Exit");

  const choice = await question("\nEnter your choice (1-3): ");

  switch (choice) {
    case '1':
      console.log("\n🚀 Creating repository and uploading files...");
      try {
        const { execSync } = await import('child_process');
        execSync('npm run setup-github', { stdio: 'inherit' });
      } catch (error) {
        console.error("❌ Error running setup script:", error.message);
      }
      break;
      
    case '2':
      console.log("\n🔍 Testing GitHub connection...");
      try {
        const { execSync } = await import('child_process');
        execSync('node -e "import(\\"./mcp-github-server.js\\").then(() => console.log(\\"Connection test complete\\"))"', { stdio: 'inherit' });
      } catch (error) {
        console.error("❌ Connection test failed:", error.message);
      }
      break;
      
    case '3':
      console.log("👋 Goodbye!");
      break;
      
    default:
      console.log("❌ Invalid choice. Please run the script again.");
  }

  rl.close();
}

initializeProject().catch(console.error);
