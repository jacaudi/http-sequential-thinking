#!/usr/bin/env node

// Polyfill for EventSource in Node.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const EventSource = require('eventsource');
global.EventSource = EventSource;

// Simple test client for the SSE server
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function testSSEServer() {
    console.log("Connecting to SSE server...");

    const client = new Client({
        name: "test-client",
        version: "1.0.0"
    }, {
        capabilities: {}
    });

    const transport = new SSEClientTransport(
        new URL("http://127.0.0.1:3000/sse")
    );

    try {
        await client.connect(transport);
        console.log("Connected successfully!");

        // List available tools
        const tools = await client.listTools();
        console.log("Available tools:", tools);

        // Test the sequential thinking tool
        console.log("\nTesting sequential thinking tool...");
        const result = await client.callTool("sequentialthinking", {
            thought: "Testing the SSE transport implementation",
            nextThoughtNeeded: true,
            thoughtNumber: 1,
            totalThoughts: 3
        });

        console.log("Result:", result);

        // Test another thought
        const result2 = await client.callTool("sequentialthinking", {
            thought: "The SSE transport seems to be working correctly",
            nextThoughtNeeded: true,
            thoughtNumber: 2,
            totalThoughts: 3
        });

        console.log("Result 2:", result2);

        // Final thought
        const result3 = await client.callTool("sequentialthinking", {
            thought: "Successfully tested the SSE implementation",
            nextThoughtNeeded: false,
            thoughtNumber: 3,
            totalThoughts: 3
        });

        console.log("Result 3:", result3);

        await client.close();
        console.log("\nTest completed successfully!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

testSSEServer().catch(console.error); 