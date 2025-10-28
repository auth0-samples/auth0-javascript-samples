# Contributing to Cap'n Web + Auth0 Demo

Thank you for your interest in contributing to this project! This demo showcases the integration between Cap'n Web RPC and Auth0 authentication.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/capn-web-auth0-demo.git`
3. Install dependencies: `npm install`
4. Set up environment: `npm run setup`
5. Update `.env` with your Auth0 configuration
6. Start the development server: `npm run dev`

## Development Guidelines

### Code Style
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Maintain the existing dark theme design patterns

### Security
- Never commit credentials or API keys
- All authentication logic should be server-side validated
- Follow object-capability security patterns
- Test all authentication flows thoroughly

### Documentation
- Update README.md for any new features
- Add inline comments for complex RPC interactions
- Update the environment configuration examples

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly with different Auth0 configurations
4. Update documentation if needed
5. Submit a pull request with a clear description

## Testing

Before submitting a PR:
- Test the authentication flow end-to-end
- Verify WebSocket RPC calls work correctly
- Check that the pipelining demo functions properly
- Test with both development and production-like environments

## Questions?

Feel free to open an issue for questions about:
- Cap'n Web RPC implementation
- Auth0 integration patterns
- Project structure and architecture
- Development setup issues

Thank you for contributing! 🚀