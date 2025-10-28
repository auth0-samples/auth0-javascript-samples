// Auth0 Configuration - Loaded dynamically from server
let AUTH0_CONFIG = null;

// Load configuration from server
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status}`);
    }
    const config = await response.json();
    
    AUTH0_CONFIG = {
      domain: config.auth0.domain,
      clientId: config.auth0.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: config.auth0.audience
      }
    };
    
    console.log('✅ Configuration loaded successfully');
    return AUTH0_CONFIG;
  } catch (error) {
    console.error('❌ Failed to load configuration:', error);
    throw error;
  }
}

class ProfileApp {
  constructor() {
    this.auth0 = null;
    this.profileService = null;
    this.sessionId = null;
    this.initializeApp();
  }

  async initializeApp() {
    try {
      // Load configuration from server
      this.showStatus('Loading configuration...', 'info');
      await loadConfig();
      
      if (!AUTH0_CONFIG) {
        throw new Error('Failed to load Auth0 configuration');
      }
      
      // Initialize Auth0
      this.showStatus('Initializing Auth0...', 'info');
      this.auth0 = await auth0.createAuth0Client(AUTH0_CONFIG);
      
      // Check if user is returning from login
      const query = window.location.search;
      if (query.includes('code=') && query.includes('state=')) {
        this.showStatus('Processing login...', 'info');
        await this.auth0.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check authentication status
      const isAuthenticated = await this.auth0.isAuthenticated();
      
      if (isAuthenticated) {
        await this.handleAuthenticated();
      } else {
        this.showLoginScreen();
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showStatus('Failed to initialize application', 'error');
    }
  }

  setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    document.getElementById('saveBtn').addEventListener('click', () => this.saveProfile());
    document.getElementById('fetchBtn').addEventListener('click', () => this.fetchProfile());
    document.getElementById('pipelineBtn').addEventListener('click', () => this.demoPipelining());
  }

  async login() {
    try {
      await this.auth0.loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin,
          audience: AUTH0_CONFIG.authorizationParams.audience,
          scope: 'openid profile email'
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      this.showStatus('Login failed', 'error');
    }
  }

  async logout() {
    try {
      // Close Cap'n Web connection
      if (this.profileService && this.profileService[Symbol.dispose]) {
        this.profileService[Symbol.dispose]();
        this.profileService = null;
      }
      
      await this.auth0.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async handleAuthenticated() {
    try {
      const user = await this.auth0.getUser();
      
      // Show profile section
      this.showProfileScreen(user);
      
      // Initialize Cap'n Web connection
      await this.initializeCapnWeb();
      
      // Automatically fetch profile
      await this.fetchProfile();
      
    } catch (error) {
      console.error('Error handling authentication:', error);
      this.showStatus('Authentication error', 'error');
    }
  }

  async initializeCapnWeb() {
    try {
      console.log('Initializing Cap\'n Web connection...');
      
      // Create WebSocket connection
      const wsUrl = `ws://${window.location.host}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      // Use our simple Cap'n Web implementation and wait for connection
      this.profileService = await CapnWeb.newWebSocketRpcSession(wsUrl);
      
      console.log('Cap\'n Web RPC connection established and ready');
      
    } catch (error) {
      console.error('Error initializing Cap\'n Web:', error);
      throw error;
    }
  }

  async fetchProfile() {
    try {
      this.setLoading(true);
      
      if (!this.profileService) {
        throw new Error('RPC service not initialized');
      }

      let token;
      try {
        token = await this.auth0.getTokenSilently({
          authorizationParams: {
            audience: AUTH0_CONFIG.authorizationParams.audience
          }
        });
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        
        // If consent is required, redirect to login with consent
        if (tokenError.error === 'consent_required' || tokenError.error === 'interaction_required') {
          console.log('Consent required, redirecting to login...');
          await this.auth0.loginWithRedirect({
            authorizationParams: {
              audience: AUTH0_CONFIG.authorizationParams.audience,
              scope: 'openid profile email',
              prompt: 'consent'
            }
          });
          return;
        }
        throw tokenError;
      }
      
      console.log('Fetching profile with token...');
      console.log('Token type:', typeof token);
      console.log('Token length:', token ? token.length : 'null');
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'null');
      
      // Call the getProfile method via Cap'n Web RPC
      const profile = await this.profileService.getProfile(token);
      
      document.getElementById('bioTextarea').value = profile.bio || '';
      this.showStatus('Profile loaded successfully', 'success');
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.showStatus('Failed to fetch profile: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async saveProfile() {
    try {
      this.setLoading(true);
      
      if (!this.profileService) {
        throw new Error('RPC service not initialized');
      }

      const bio = document.getElementById('bioTextarea').value.trim();
      const token = await this.auth0.getTokenSilently({
        authorizationParams: {
          audience: AUTH0_CONFIG.authorizationParams.audience
        }
      });
      
      console.log('Saving profile with bio length:', bio.length);
      
      // Call the updateProfile method via Cap'n Web RPC
      const result = await this.profileService.updateProfile(token, bio);
      
      if (result.success) {
        this.showStatus('Profile saved successfully', 'success');
      } else {
        this.showStatus('Failed to save profile', 'error');
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showStatus('Failed to save profile: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async demoPipelining() {
    try {
      this.setLoading(true);
      
      if (!this.profileService) {
        throw new Error('RPC service not initialized');
      }

      const token = await this.auth0.getTokenSilently({
        authorizationParams: {
          audience: AUTH0_CONFIG.authorizationParams.audience
        }
      });
      
      this.showStatus('🚀 Demonstrating Cap\'n Web RPC Pipelining...', 'info');
      
      // Get current bio from the textarea
      const currentBio = document.getElementById('bioTextarea').value.trim();
      const timestamp = new Date().toLocaleTimeString();
      const newBio = `${currentBio} [Pipelined update at ${timestamp}]`;
      
      console.log('Demo: Starting pipelined operations...');
      console.log('1. Fetching current profile (before update)');
      console.log('2. Updating profile with new bio');
      console.log('3. Both operations running concurrently!');
      
      // 🎯 PIPELINING DEMO: Start both operations simultaneously
      // This demonstrates Cap'n Web's ability to pipeline multiple RPC calls
      const startTime = performance.now();
      
      const [oldProfile, updateResult] = await Promise.all([
        // Operation 1: Fetch the current profile (before update)
        this.profileService.getProfile(token),
        // Operation 2: Update the profile with new bio (simultaneously)
        this.profileService.updateProfile(token, newBio)
      ]);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`Pipelining completed in ${duration}ms`);
      console.log('Old profile bio:', oldProfile.bio);
      console.log('Update result:', updateResult);
      
      // Show the results in a nice format
      const oldBioPreview = oldProfile.bio ? 
        (oldProfile.bio.length > 50 ? oldProfile.bio.substring(0, 50) + '...' : oldProfile.bio) : 
        '(empty)';
      
      this.showStatus(
        `✨ Pipelining Demo Complete! ` +
        `Fetched old bio: "${oldBioPreview}" & ` +
        `updated profile simultaneously in ${duration}ms`, 
        'success'
      );
      
      // Wait a moment, then fetch the updated profile to show the change
      setTimeout(async () => {
        await this.fetchProfile();
        this.showStatus(
          `🔄 Profile refreshed! Notice how the bio now includes the pipelined update. ` +
          `This demonstrates real-time RPC capability.`, 
          'info'
        );
      }, 2000);
      
    } catch (error) {
      console.error('Error in pipelining demo:', error);
      this.showStatus('❌ Pipelining demo failed: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  showLoginScreen() {
    const authSection = document.getElementById('authSection');
    const profileSection = document.getElementById('profileSection');
    
    if (authSection) authSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'none';
  }

  showProfileScreen(user) {
    const authSection = document.getElementById('authSection');
    const profileSection = document.getElementById('profileSection');
    const userEmailEl = document.getElementById('userEmail');
    
    if (authSection) authSection.style.display = 'none';
    if (profileSection) profileSection.style.display = 'block';
    if (userEmailEl) userEmailEl.textContent = user.email || user.name || 'Unknown User';
  }

  setLoading(loading) {
    const container = document.querySelector('.main-container');
    if (container) {
      if (loading) {
        container.classList.add('loading');
      } else {
        container.classList.remove('loading');
      }
    }
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('status');
    if (!statusEl) {
      console.warn('Status element not found');
      return;
    }
    
    statusEl.innerHTML = message; // Use innerHTML to support icons/HTML
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
    
    // Auto-hide success/info messages after 5 seconds, keep errors visible
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (statusEl) statusEl.style.display = 'none';
      }, 5000);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProfileApp();
});