import { RpcTarget } from 'capnweb';
import { WebSocketServer } from 'ws';
import { ApiClient } from '@auth0/auth0-api-js';
import http from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// In-memory user profile store
const userProfiles = new Map();

// Auth0 configuration from environment variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// Validate required environment variables
if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  console.error('❌ Missing required environment variables:');
  if (!AUTH0_DOMAIN) console.error('   - AUTH0_DOMAIN is required');
  if (!AUTH0_AUDIENCE) console.error('   - AUTH0_AUDIENCE is required');
  console.error('📝 Please copy .env.example to .env and update with your Auth0 configuration');
  process.exit(1);
}

// Initialize Auth0 API client for token verification
const auth0ApiClient = new ApiClient({
  domain: AUTH0_DOMAIN,
  audience: AUTH0_AUDIENCE
});

// Verify Auth0 JWT/JWE token using the official Auth0 API client
async function verifyToken(token) {
  try {
    const payload = await auth0ApiClient.verifyAccessToken({
      accessToken: token
    });
    return payload;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Simple helper to simulate server-side processing latency (like Cloudflare examples)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Profile Service - Cap'n Web RPC Target (following Cloudflare pattern)
class ProfileService extends RpcTarget {
  constructor() {
    super();
    // Store for user sessions
    this.userSessions = new Map();
  }

  // Get user profile data (main RPC method)
  async getProfile(accessToken) {
    await sleep(Number(process.env.DELAY_PROFILE_MS ?? 80));
    console.log('ProfileService.getProfile() called with token:', accessToken ? 'present' : 'missing');
    console.log('Token type:', typeof accessToken);
    console.log('Token value (first 50 chars):', typeof accessToken === 'string' ? accessToken.substring(0, 50) + '...' : accessToken);
    
    try {
      const decoded = await verifyToken(accessToken);
      const userId = decoded.sub;
      console.log(`Token verified for user: ${userId}`);
      
      const profile = userProfiles.get(userId) || { bio: '' };
      
      return {
        id: userId,
        email: decoded.email || decoded.name || 'Unknown User',
        bio: profile.bio
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid access token');
    }
  }

  // Update user profile data (main RPC method)
  async updateProfile(accessToken, bio) {
    await sleep(Number(process.env.DELAY_PROFILE_MS ?? 80));
    console.log('ProfileService.updateProfile() called');
    
    try {
      const decoded = await verifyToken(accessToken);
      const userId = decoded.sub;
      console.log(`Updating profile for user: ${userId}, bio length: ${bio?.length || 0}`);
      
      userProfiles.set(userId, { bio });
      
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid access token');
    }
  }
}

// Create HTTP server with WebSocket support
const server = http.createServer(async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL to handle query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Serve static files for the client (handle root path with any query params)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = readFileSync(join(__dirname, '../client/index.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(html);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }

  // Serve client JavaScript files
  if (url.pathname === '/client.js') {
    try {
      const js = readFileSync(join(__dirname, '../client/client.js'), 'utf8');
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(js);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }

  // Serve Cap'n Web browser implementation
  if (url.pathname === '/capnweb-browser.js') {
    try {
      const js = readFileSync(join(__dirname, '../client/capnweb-browser.js'), 'utf8');
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(js);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }

  // Serve Auth0 configuration (public data only)
  if (url.pathname === '/api/config') {
    try {
      const config = {
        auth0: {
          domain: AUTH0_DOMAIN,
          clientId: process.env.AUTH0_CLIENT_ID,
          audience: AUTH0_AUDIENCE
        }
      };
      
      // Validate that we have the required configuration
      if (!config.auth0.domain || !config.auth0.clientId || !config.auth0.audience) {
        res.writeHead(500);
        res.end(JSON.stringify({ 
          error: 'Server configuration incomplete. Please check environment variables.' 
        }));
        return;
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(config));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Configuration error' }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Create WebSocket server for Cap'n Web RPC
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info) => {
    console.log('WebSocket connection request from:', info.origin);
    return true; // Allow all connections for development
  }
});

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  
  const profileService = new ProfileService();
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received RPC message:', { type: message.type, method: message.method, id: message.id });
      
      if (message.type === 'call') {
        try {
          const result = await profileService[message.method](...(message.params || []));
          console.log(`RPC call ${message.method} succeeded`);
          
          ws.send(JSON.stringify({
            type: 'response',
            id: message.id,
            result: result
          }));
        } catch (error) {
          console.error(`RPC call ${message.method} failed:`, error);
          
          ws.send(JSON.stringify({
            type: 'response',
            id: message.id,
            error: error.message
          }));
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      
      // Send error response if we can parse the message ID
      try {
        const message = JSON.parse(data.toString());
        if (message.id) {
          ws.send(JSON.stringify({
            type: 'response',
            id: message.id,
            error: 'Invalid message format'
          }));
        }
      } catch (parseError) {
        // Ignore parsing errors for error responses
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, () => {
  console.log(`
🚀 Cap'n Web + Auth0 Demo Server
▶️  Server running on http://${HOST}:${PORT}
🔗 WebSocket RPC available for real-time communication
📖 API Documentation: See README.md for full setup guide

🔧 Configuration:
   - Auth0 Domain: ${AUTH0_DOMAIN}
   - Auth0 Audience: ${AUTH0_AUDIENCE}
   - Environment: ${process.env.NODE_ENV || 'development'}

👥 For Developers:
   1. Copy .env.example to .env and update with your Auth0 configuration
   2. Visit http://${HOST}:${PORT} to test the application
   3. Try the pipelining demo to see concurrent RPC calls
   4. Configuration available at: http://${HOST}:${PORT}/api/config

📚 Learn More:
   - Auth0 Docs: https://auth0.com/docs
   - Cap'n Web: https://blog.cloudflare.com/capnweb-javascript-rpc-library/
  `);
});