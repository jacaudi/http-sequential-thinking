# Sequential Thinking MCP Server - Streamable HTTP Implementation

An MCP server that provides a powerful sequential thinking tool for complex problem-solving through thoughts.

This server enables AI assistants to work through problems step-by-step, with the ability to revise, branch, and explore alternative approaches as understanding deepens.

## Features

- **Dynamic Thought Process**: Adjust the number of thoughts as you progress
- **Revision Capability**: Question and revise previous thoughts
- **Branching Logic**: Explore alternative approaches
- **Flexible Planning**: Add more thoughts even after reaching initial estimates
- **Context Preservation**: Maintain context across multiple thinking steps

## Getting Started

To get started with this server, clone the repository and install the necessary dependencies.

```bash
git clone https://github.com/jacaudi/http-sequential-thinking.git
cd http-sequential-thinking
npm install
```

## Usage

### Streamable HTTP Transport

The server uses the modern Streamable HTTP transport protocol for communication. Start the server:

```bash
npm start
```

The server will start on `http://127.0.0.1:3000` by default. You can change the port using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Endpoints

- **MCP Endpoint**: `POST/GET/DELETE http://127.0.0.1:3000/mcp` - Main MCP communication endpoint
  - `POST` - Send messages to the server (initialize, tool calls, etc.)
  - `GET` - Establish SSE stream for server-to-client notifications
  - `DELETE` - Terminate session
- **Health Check**: `GET http://127.0.0.1:3000/health` - Check server status and active sessions
- **Test Interface**: `GET http://127.0.0.1:3000/` - Browser-based test interface

### Transport Features

The Streamable HTTP transport provides several advantages:

- **Session-Based State**: Manages state for each client session in memory. The core server is long-running and can be scaled with sticky sessions.
- **Flexible Streaming**: Server can upgrade any response to SSE for streaming
- **Infrastructure Compatible**: Works with standard HTTP middleware and proxies
- **Resumable Connections**: Support for connection resumption
- **Automatic Session Cleanup**: Inactive sessions and their associated data are automatically cleared after 1 hour to conserve resources.

### Security

The implementation includes security measures:
- Origin header validation to prevent DNS rebinding attacks
- Server binds only to localhost (127.0.0.1)
- CORS headers are properly configured
- Session IDs are cryptographically secure
- **Privacy by Design**: No sensitive tool inputs or outputs are logged to the console.

### Adding to Cursor

To use this server with Cursor, add the following to your Cursor configuration:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "url": "http://localhost:3000/mcp"
    },
  }
}
```

### Running with Docker

You can also run the server in a containerized environment using Docker for easier deployment and isolation.

1.  **Build the Docker image:**
    ```bash
    docker build -t http-sequential-thinking .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -p 3000:3000 http-sequential-thinking
    ```

The server will be accessible at `http://127.0.0.1:3000`.

## Available Tool

### sequentialthinking

A detailed tool for dynamic and reflective problem-solving through thoughts.

**When to use:**
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Multi-step solutions requiring context preservation

**Parameters:**
- `thought` (string, required): Your current thinking step
- `nextThoughtNeeded` (boolean, required): Whether another thought step is needed
- `thoughtNumber` (integer, required): Current thought number
- `totalThoughts` (integer, required): Estimated total thoughts needed
- `isRevision` (boolean, optional): Whether this revises previous thinking
- `revisesThought` (integer, optional): Which thought is being reconsidered
- `branchFromThought` (integer, optional): Branching point thought number
- `branchId` (string, optional): Branch identifier
- `needsMoreThoughts` (boolean, optional): If more thoughts are needed

## License

MIT
