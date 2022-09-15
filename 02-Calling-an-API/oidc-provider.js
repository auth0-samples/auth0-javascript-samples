const Provider = require('oidc-provider');

const client = {
  client_id: 'dpop',
  token_endpoint_auth_method: 'none',
  response_types: ['id_token', 'code', 'code id_token'],
  grant_types: ['implicit', 'authorization_code', 'refresh_token'],
  redirect_uris: [`http://localhost:3000`],
  post_logout_redirect_uris: [
    'http://localhost:3000',
  ],
};

const config = {
  clients: [
    client,
  ],
  formats: {
    AccessToken: 'jwt',
  },
  audiences() {
    return 'https://api.example.com/products';
  },
  scopes: ['openid', 'offline_access', 'read:products'],
  routes: {
    authorization: '/authorize', // lgtm [js/hardcoded-credentials]
    token: '/oauth/token',
    end_session: '/v2/logout'
  },
  clientBasedCORS(ctx, origin, client) {
    return true;
  },
  findAccount(ctx, id) {
    return {
      accountId: id,
      claims: () => ({ sub: id }),
    };
  },
  features: {
    dPoP: {
      enabled: true
    },
    webMessageResponseMode: {
      enabled: true
    },
  }
};

const PORT = process.env.PROVIDER_PORT || 3001;

const provider = new Provider(`http://localhost:3001/`, config);

// Monkey patch the provider to allow localhost and http redirect uris
const { invalidate: orig } = provider.Client.Schema.prototype;
provider.Client.Schema.prototype.invalidate = function invalidate(
    message,
    code
) {
  if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') {
    return;
  }
  orig.call(this, message);
};

module.exports = provider;
