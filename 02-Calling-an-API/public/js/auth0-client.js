//import { createAuth0Client } from "@auth0/auth0-spa-js";
// Normally this would be the import statement above.
// For this example we do not have client dependencies installed via npm.
const createAuth0Client = globalThis.auth0.createAuth0Client;

const fetchAuthConfig = () => fetch("/auth_config.json");

/**
 * Called once to create a single instance of the Auth0 SDK client
 * @returns Auth0Client
 */
async function createClient() {
  const response = await fetchAuthConfig();
  const config = await response.json();
  return await createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
    cacheLocation: config.cacheLocation,
    useRefreshTokens: true,
    authorizationParams: {
      audience: config.audience,
    },
  });
}

/**
 * Starts the authentication flow
 */
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0Client.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Executes the logout flow
 */
const logout = async () => {
  try {
    console.log("Logging out");
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

const auth0Client = await createClient();

export { auth0Client, login, logout, requireAuth };
