#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

class GitHubMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "github-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_repository",
            description: "Create a new GitHub repository",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Repository name",
                },
                description: {
                  type: "string",
                  description: "Repository description",
                },
                private: {
                  type: "boolean",
                  description: "Whether the repository should be private",
                  default: false,
                },
                auto_init: {
                  type: "boolean",
                  description: "Whether to initialize the repository with a README",
                  default: true,
                },
              },
              required: ["name"],
            },
          },
          {
            name: "upload_files",
            description: "Upload files to a GitHub repository",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner (username)",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: {
                        type: "string",
                        description: "File path in the repository",
                      },
                      localPath: {
                        type: "string",
                        description: "Local file path to upload",
                      },
                    },
                    required: ["path", "localPath"],
                  },
                  description: "Array of files to upload",
                },
                message: {
                  type: "string",
                  description: "Commit message",
                  default: "Initial commit",
                },
              },
              required: ["owner", "repo", "files"],
            },
          },
          {
            name: "get_user",
            description: "Get the authenticated user's information",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "list_repositories",
            description: "List user's repositories",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["all", "owner", "public", "private", "member"],
                  default: "owner",
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "create_repository":
            return await this.createRepository(args);
          case "upload_files":
            return await this.uploadFiles(args);
          case "get_user":
            return await this.getUser();
          case "list_repositories":
            return await this.listRepositories(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async createRepository(args) {
    const { name, description, private: isPrivate, auto_init } = args;

    const response = await this.octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init,
    });

    return {
      content: [
        {
          type: "text",
          text: `Repository "${name}" created successfully!\nURL: ${response.data.html_url}\nClone URL: ${response.data.clone_url}`,
        },
      ],
    };
  }

  async uploadFiles(args) {
    const { owner, repo, files, message } = args;
    const results = [];

    for (const file of files) {
      const { path, localPath } = file;

      if (!existsSync(localPath)) {
        results.push(`❌ File not found: ${localPath}`);
        continue;
      }

      try {
        const content = readFileSync(localPath, { encoding: "base64" });
        
        await this.octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path,
          message: `${message}: ${path}`,
          content,
        });

        results.push(`✅ Uploaded: ${path}`);
      } catch (error) {
        results.push(`❌ Failed to upload ${path}: ${error.message}`);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: results.join("\n"),
        },
      ],
    };
  }

  async getUser() {
    const response = await this.octokit.users.getAuthenticated();
    const user = response.data;

    return {
      content: [
        {
          type: "text",
          text: `Authenticated as: ${user.login}\nName: ${user.name}\nEmail: ${user.email}\nPublic repos: ${user.public_repos}`,
        },
      ],
    };
  }

  async listRepositories(args) {
    const { type } = args;
    const response = await this.octokit.repos.listForAuthenticatedUser({
      type,
      per_page: 30,
    });

    const repos = response.data.map(repo => 
      `${repo.name} - ${repo.description || "No description"} (${repo.private ? "Private" : "Public"})`
    ).join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Your repositories:\n${repos}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("GitHub MCP server running on stdio");
  }
}

const server = new GitHubMCPServer();
server.run().catch(console.error);
