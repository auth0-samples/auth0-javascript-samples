# Cap'n Web + Auth0 Demo: User Profile Management

> **A production-ready sample application showcasing secure user profile management using Cap'n Web RPC and Auth0 authentication**

## 🎯 What This Demo Shows

This application demonstrates how to build a **user profile management system** that combines:

- **🔐 Auth0 Authentication**: Users log in securely using Auth0's hosted login page
- **⚡ Cap'n Web RPC**: Real-time API calls for profile operations via WebSocket RPC
- **👤 Profile Management**: Users can view and edit their personal profile information
- **🛡️ JWT Authorization**: Auth0 JWT tokens authorize all API calls to ensure users only access their own data

### Use Case: Personal Profile Dashboard

**The Story**: Users need a secure way to manage their profile information. Auth0 handles the complex authentication flow, while Cap'n Web provides fast, real-time API communication for profile updates.

**User Journey**:
1. **Landing Page** → User clicks "Authenticate with Auth0"
2. **Auth0 Login** → Secure authentication via Auth0's hosted login
3. **Profile Dashboard** → User sees their email and can edit their bio
4. **Real-time Updates** → Profile changes are saved instantly via WebSocket RPC
5. **Data Security** → JWT tokens ensure users only see/edit their own profiles

**Technical Flow**:
- Auth0 provides secure user authentication and JWT tokens
- Cap'n Web RPC handles profile API calls (get/update profile)
- Server validates JWT tokens and isolates user data
- In-memory storage keeps the demo simple while showing the patterns

This demo application demonstrates how to build secure, real-time applications using [Cap'n Web RPC](https://github.com/cloudflare/capnweb) with [Auth0](https://github.com/auth0/auth0-spa-js) authentication. It features object-capability security, WebSocket-based RPC communication, and JWT token verification.

![Auth0 + Cap'n Web Demo](https://img.shields.io/badge/Auth0-Integration-orange) ![Cap'n Web RPC](https://img.shields.io/badge/Cap'n%20Web-RPC-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

- **🔐 Secure Authentication**: Auth0 handles user login with industry-standard security
- **👤 User Profile Management**: View and edit personal profile information (email, bio)
- **⚡ Real-time RPC**: Cap'n Web provides fast WebSocket-based API communication
- **🛡️ JWT Authorization**: Auth0 tokens authorize all API calls to protect user data
- **🎨 Modern UI**: Clean, responsive dark theme with Auth0 branding
- **🔄 Live Updates**: Profile changes saved instantly without page refreshes
- **� Production Ready**: Environment-based configuration, Docker support, comprehensive documentation
- **🧹 Developer Friendly**: Easy setup, clear error handling, debugging tools included

## 📁 Project Structure

```
capn-web-auth0-demo/
├── client/                    # Frontend application
│   ├── index.html            # Main UI with Auth0 branding & dark theme
│   ├── client.js             # Auth0 integration & Cap'n Web RPC client
│   └── capnweb-browser.js    # Browser-compatible Cap'n Web implementation
├── server/                    # Backend application
│   └── index.js              # WebSocket RPC server with JWT validation
├── scripts/                   # Maintenance and setup scripts
│   └── cleanup.sh            # Repository validation script
├── .env.example              # Environment configuration template
├── .gitignore                # Git ignore patterns
├── CONTRIBUTING.md           # Contribution guidelines
├── Dockerfile                # Container configuration
├── docker-compose.yml        # Multi-container development setup
└── package.json              # Dependencies, scripts, and metadata
```

## ⚡ Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/auth0-samples/auth0-javascript-samples.git
   cd 03-Capn-Web
   npm install
   ```

2. **Set up environment:**
   ```bash
   npm run setup
   # Then edit .env with your Auth0 configuration
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

### Server Side (Node.js)
- **ProfileService**: Cap'n Web RPC target with two methods:
  - `getProfile()`: Returns user email and bio based on Auth0 token
  - `updateProfile(newBio)`: Updates user bio with Auth0 token validation
- **Auth0 Integration**: JWT token verification with JWKS
- **In-memory Storage**: User profiles stored by Auth0 user ID

### Client Side (Vanilla JavaScript)
- **Auth0 SPA SDK**: Handles login/logout flow
- **Cap'n Web Client**: WebSocket RPC communication
- **Profile UI**: Bio editing with save/fetch functionality

## 📋 Prerequisites

- **Node.js 18+** (LTS recommended)
- **Auth0 account** - Free tier available at [auth0.com](https://auth0.com)
- **Modern web browser** with WebSocket support
- **Git** for cloning the repository

## ⚙️ Setup

### 1. Auth0 Configuration

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new Single Page Application
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Note down your:
   - Domain (e.g., `your-domain.us.auth0.com`)
   - Client ID
   - API Audience (if using Auth0 APIs)

### 2. Environment Configuration

⚠️ **IMPORTANT**: Never commit credentials to your repository!

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Auth0 configuration:
   ```bash
   # Auth0 Configuration
   AUTH0_DOMAIN=your-domain.us.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_AUDIENCE=https://api.your-app.com
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

3. The application will automatically load these values - no code changes needed!

### 3. Install Dependencies

```bash
npm install
```

## 🚀 Running the Application

1. Start the server:

```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## 🔄 User Flow

1. **Landing Page**: User sees a "Log In" button
2. **Auth0 Login**: Clicking login redirects to Auth0 authentication
3. **Authenticated State**: After login, user sees:
   - Their email address (from Auth0 token)
   - A text area for bio editing
   - Save, Fetch, and Logout buttons
4. **Profile Management**:
   - **Save**: Updates bio via Cap'n Web RPC call
   - **Fetch**: Retrieves saved bio from server
   - **Logout**: Clears session and returns to login screen

## 🔧 Technical Details

### Cap'n Web RPC Flow

1. Client establishes WebSocket connection to `/api`
2. Auth0 token is sent for authentication
3. Server creates `ProfileService` instance with user token
4. RPC calls are made through Cap'n Web protocol
5. Server validates token on each call and isolates data by user ID

### Security Features

- **Token Validation**: All RPC calls validate Auth0 JWT tokens
- **User Isolation**: Profiles are stored and retrieved by Auth0 user ID
- **Object Capabilities**: Cap'n Web's object-capability model ensures secure RPC

### API Methods

#### `getProfile()`
- **Returns**: `{ email: string, bio: string }`
- **Security**: Validates Auth0 token and returns user-specific data

#### `updateProfile(newBio)`
- **Parameters**: `newBio: string`
- **Returns**: `{ success: boolean, message: string }`
- **Security**: Validates Auth0 token and updates user-specific data

## � Docker Support

Run the application using Docker for consistent development environments:

### Using Docker Compose (Recommended)
```bash
# Start with docker-compose
npm run docker:dev

# Or manually
docker-compose up --build
```

### Using Docker directly
```bash
# Build the image
npm run docker:build

# Run with environment file
npm run docker:run
```

The Docker setup includes:
- Node.js 18 Alpine base image
- Non-root user for security
- Health checks for monitoring
- Volume mounts for development

## 🔗 Key Dependencies

- **capnweb**: RPC library for browser-server communication
- **dotenv**: Environment variable management
- **jsonwebtoken**: JWT token verification
- **jwks-client**: Auth0 JWKS key retrieval
- **ws**: WebSocket server implementation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup guidelines
- Code style requirements
- Security considerations
- Pull request process

For questions or issues, please:
1. Check existing [issues](https://github.com/YOUR_USERNAME/capn-web-auth0-demo/issues)
2. Review the [troubleshooting section](#-troubleshooting)
3. Open a new issue with detailed information

## 🐛 Troubleshooting

### Common Issues

1. **Auth0 Configuration**: Ensure domain and client ID are correct
2. **CORS Issues**: Check that callback URLs are properly configured
3. **WebSocket Connection**: Verify server is running on correct port
4. **Token Validation**: Check Auth0 domain and audience configuration

### Development Tips

- Check browser console for detailed error messages
- Monitor server logs for authentication and RPC call details
- Use browser DevTools to inspect WebSocket traffic
- Verify Auth0 token in [jwt.io](https://jwt.io) for debugging
- Run `npm run cleanup` to validate repository setup

## 📚 Learn More

- [Cap'n Web Documentation](https://github.com/cloudflare/capnweb)
- [Auth0 SPA SDK Guide](https://auth0.com/docs/libraries/auth0-spa-js)
- [Cap'n Web Blog Post](https://blog.cloudflare.com/capnweb-javascript-rpc-library/)

## � What You'll Learn

This demo teaches you how to:

- **Integrate Auth0** for secure user authentication in web applications
- **Use Cap'n Web RPC** for real-time, WebSocket-based API communication  
- **Handle JWT tokens** for API authorization and user data protection
- **Build responsive UIs** with modern web technologies and dark themes
- **Structure projects** for production deployment with Docker and environment management
- **Implement user data isolation** ensuring users can only access their own profiles

Perfect for developers exploring modern authentication patterns, real-time communication, or looking for a foundation to build user-centric applications.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for developers exploring Auth0 and Cap'n Web integration**