/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * MCP Server for ClickUp integration (Read-Only Version)
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import config from "./config.js";
import { workspaceHierarchyTool, handleGetWorkspaceHierarchy } from "./tools/workspace.js";
import { getTaskTool, getTaskCommentsTool, getWorkspaceTasksTool, getTaskTimeEntriesTool, getCurrentTimeEntryTool, handleGetTask, handleGetTaskComments, handleGetWorkspaceTasks, handleGetTaskTimeEntries, handleGetCurrentTimeEntry } from "./tools/task/index.js";
import { getListTool, handleGetList } from "./tools/list.js";
import { getFolderTool, handleGetFolder } from "./tools/folder.js";
import { getSpaceTagsTool, handleGetSpaceTags } from "./tools/tag.js";
import { getDocumentTool, listDocumentsTool, listDocumentPagesTool, getDocumentPagesTool, handleGetDocument, handleListDocuments, handleListDocumentPages, handleGetDocumentPages } from "./tools/documents.js";
import { getWorkspaceMembersTool, findMemberByNameTool, handleGetWorkspaceMembers, handleFindMemberByName } from "./tools/member.js";
import { Logger } from "./logger.js";
import { clickUpServices } from "./services/shared.js";
// Create a logger instance for server
const logger = new Logger('Server');
// Use existing services from shared module instead of creating new ones
const { workspace } = clickUpServices;
// Create server instance
export const server = new Server({
    name: "clickup-mcp-server",
    version: "0.7.2",
});
/**
 * Configure the server routes and handlers
 */
export function configureServer() {
    logger.info("Registering server request handlers");
    // Register ListTools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        logger.debug("Received ListTools request");
        return {
            tools: [
                workspaceHierarchyTool,
                getTaskTool,
                getTaskCommentsTool,
                getWorkspaceTasksTool,
                getTaskTimeEntriesTool,
                getCurrentTimeEntryTool,
                getListTool,
                getFolderTool,
                getSpaceTagsTool,
                getWorkspaceMembersTool,
                findMemberByNameTool,
                getDocumentTool,
                listDocumentsTool,
                listDocumentPagesTool,
                getDocumentPagesTool
            ].filter(tool => !config.disabledTools.includes(tool.name))
        };
    });
    // Add handler for resources/list
    server.setRequestHandler(ListResourcesRequestSchema, async (req) => {
        logger.debug("Received ListResources request");
        return { resources: [] };
    });
    // Add handler for prompts/list
    server.setRequestHandler(ListPromptsRequestSchema, async (req) => {
        logger.debug("Received ListPrompts request");
        return { prompts: [] };
    });
    // Add handler for prompts/get
    server.setRequestHandler(GetPromptRequestSchema, async (req) => {
        logger.debug("Received GetPrompt request");
        return { prompt: null };
    });
    // Add handler for tools/call
    server.setRequestHandler(CallToolRequestSchema, async (req) => {
        const { name, arguments: params } = req.params;
        switch (name) {
            case "get_workspace_hierarchy":
                return handleGetWorkspaceHierarchy();
            case "get_task":
                return handleGetTask(params);
            case "get_task_comments":
                return handleGetTaskComments(params);
            case "get_workspace_tasks":
                return handleGetWorkspaceTasks(params);
            case "get_task_time_entries":
                return handleGetTaskTimeEntries(params);
            case "get_current_time_entry":
                return handleGetCurrentTimeEntry(params);
            case "get_list":
                return handleGetList(params);
            case "get_folder":
                return handleGetFolder(params);
            case "get_space_tags":
                return handleGetSpaceTags(params);
            case "get_document":
                return handleGetDocument(params);
            case "list_documents":
                return handleListDocuments(params);
            case "list_document_pages":
                return handleListDocumentPages(params);
            case "get_document_pages":
                return handleGetDocumentPages(params);
            case "get_workspace_members":
                return handleGetWorkspaceMembers();
            case "find_member_by_name":
                return handleFindMemberByName(params);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });
}
/**
 * Export the clickup service for use in tool handlers
 */
export { workspace };
