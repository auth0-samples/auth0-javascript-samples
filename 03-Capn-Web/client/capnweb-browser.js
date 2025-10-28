// Simplified Cap'n Web browser implementation for demonstration
// In production, you would use a proper bundler like Vite, Webpack, or Rollup

// Simple polyfill for Symbol.dispose if not supported
if (!Symbol.dispose) {
  Symbol.dispose = Symbol.for('dispose');
}

// Basic RPC Target implementation
class RpcTarget {
  constructor() {
    // Mark as RPC target
    this.__isRpcTarget = true;
  }
}

// Simple RPC session implementation for WebSocket
class SimpleRpcSession {
  constructor(webSocket) {
    this.webSocket = webSocket;
    this.callId = 0;
    this.pendingCalls = new Map();
    this.isReady = false;
    this.readyPromise = null;
    
    // Wait for WebSocket to open
    if (webSocket.readyState === WebSocket.OPEN) {
      this.isReady = true;
      this.readyPromise = Promise.resolve();
    } else {
      this.readyPromise = new Promise((resolve, reject) => {
        const onOpen = () => {
          this.isReady = true;
          webSocket.removeEventListener('open', onOpen);
          webSocket.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (error) => {
          webSocket.removeEventListener('open', onOpen);
          webSocket.removeEventListener('error', onError);
          reject(error);
        };
        
        webSocket.addEventListener('open', onOpen);
        webSocket.addEventListener('error', onError);
      });
    }
    
    this.webSocket.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'response' && this.pendingCalls.has(message.id)) {
        const { resolve, reject } = this.pendingCalls.get(message.id);
        this.pendingCalls.delete(message.id);
        
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async call(method, params = []) {
    // Wait for WebSocket to be ready
    await this.readyPromise;
    
    return new Promise((resolve, reject) => {
      const id = ++this.callId;
      
      this.pendingCalls.set(id, { resolve, reject });
      
      const message = {
        type: 'call',
        id: id,
        method: method,
        params: params
      };

      try {
        this.webSocket.send(JSON.stringify(message));
      } catch (error) {
        this.pendingCalls.delete(id);
        reject(error);
        return;
      }
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingCalls.has(id)) {
          this.pendingCalls.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  [Symbol.dispose]() {
    this.webSocket.close();
  }
}

// Create a proxy that intercepts method calls and routes them through RPC
function createRpcProxy(session) {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === Symbol.dispose) {
        return () => session[Symbol.dispose]();
      }
      
      // Don't intercept promise methods or private properties
      if (typeof prop === 'string' && 
          !prop.startsWith('_') && 
          !['then', 'catch', 'finally', 'constructor', 'toString', 'valueOf'].includes(prop)) {
        return (...args) => session.call(prop, args);
      }
      
      return target[prop];
    }
  });
}

// Simple WebSocket RPC session factory
async function newWebSocketRpcSession(webSocketOrUrl) {
  const webSocket = typeof webSocketOrUrl === 'string' 
    ? new WebSocket(webSocketOrUrl)
    : webSocketOrUrl;
    
  const session = new SimpleRpcSession(webSocket);
  
  // Wait for the WebSocket to be ready
  await session.readyPromise;
  
  return createRpcProxy(session);
}

// Export for use in the application
window.CapnWeb = {
  RpcTarget,
  newWebSocketRpcSession
};