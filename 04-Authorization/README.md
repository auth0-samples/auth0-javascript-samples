# Auth0 JavaScript Authorization

This sample demonstrates how to include user authorization in a JavaScript application with Auth0.

## Getting Started

If you haven't already done so, [sign up](https://auth0.com) for your free Auth0 account and create a new client in the [dashboard](https://manage.auth0.com). Find the **domain** and **client ID** from the settings area and add the URL for your application to the **Allowed Callback URLs** box. If you are serving the application with the provided `serve` library, that URL is `http://localhost:3000`.

If you haven't already done so, create a new API in the [APIs section](https://manage.auth0.com/#/apis) and provide an identifier for it.

Clone the repo or download it from the JavaScript quickstart page in Auth0's documentation.

```bash
cd 04-Authorization
npm install
```

## Set the Client ID, Domain, and API URL

If you download the sample from the quickstart page, it will come pre-populated with the **client ID** and **domain** for your application. If you clone the repo directly from Github, rename the `auth0-variables.js.example` file to `auth0-variables.js` and provide the **client ID** and **domain** there.

You should also provide the identifier for the API you create in the Auth0 dashboard as your `apiUrl`.

## Set Up the `.env` File

In addition to the above-mentioned `auth0-variables.js` file, a `.env` file is provided at the root of the application. This file provides your application's credentials to the small Node server located in `server.js`.

This file has two values, `AUTH0_AUDIENCE` and `AUTH0_DOMAIN`. If you download this sample from the quickstart page, the value for `AUTH0_DOMAIN` will be populated automatically, but you will still need to populate `AUTH0_AUDIENCE` manually. The value for `AUTH0_AUDIENCE` is the identifier used for an API that you create in the Auth0 dashboard.

## Run the Application

The `serve` module provided with this sample can be run with the `start` command.

```bash
npm start
```

The application will be served at `http://localhost:3000`.

## Run the Application With Docker

In order to run the example with docker you need to have `docker` installed.

You also need to set the environment variables as explained [previously](#set-the-client-id-domain-and-api-url).

Execute in command line `sh exec.sh` to run the Docker in Linux, or `.\exec.ps1` to run the Docker in Windows.

## Tutorial

### Access Control in Single-Page Applications

In Single-Page Applications you use Access Control to define what different users can see, and which routes they can access.
With Auth0, you can implement access control by using scopes granted to users.

To set up access control in your application, enforce the following restrictions:

- The data from an API can only be returned if the user is authorized to access it. This needs to be done when implementing the API.
- The user can access specific routes and UI elements in your application only if they have the appropriate access level.

The previous step used the `read:messages` scope for accessing API resources. This scope indicates that the user can only view the data. You can consider users with this scope regular users. If you want to give some users permission to edit the data, you can add the `write:messages` scope.

> **Note:** Read about naming scopes and mapping them to access levels in the [Scopes documentation](https://auth0.com/docs/scopes). To learn more about custom scope claims, follow the [User profile claims and scope tutorial](https://auth0.com/docs/api-auth/tutorials/adoption/scope-custom-claims).

### Determine a User's Scopes

You can use scopes to make decisions about the behavior of your application's interface.

You can specify which scopes you want to request at the beginning of the login process.

If a scope you requested is available to the user, their Access Token receives a `scope` claim in the payload. The value of this claim is a string with all the granted scopes, but your application must treat the Access Token as opaque and must not decode it. This means that you cannot read the Access Token to access the scopes.

To get the scopes, you can use the value of the `scope` parameter that comes back after authentication. This parameter is a string containing all the scopes granted to the user, separated by spaces. This parameter will be populated only if the scopes granted to the user are different than those you requested.

To see which scopes are granted to the user, check for the value of `authResult.scope`. If there is no value for `authResult.scope`, all the requested scopes were granted.

## Handle Scopes in the `app.js` File

Adjust your `app.js` file, so it uses a local member with any scopes you want to request when users log in. Use this member in your instance of the `auth0.WebAuth` object.

```js
// app.js

var requestedScopes = "openid profile read:messages write:messages";

var auth0 = new auth0.WebAuth({
  // ...
  scope: requestedScopes
});
```

<%= include('../\_includes/\_authz_set_session') %>

```js
// app.js

function localLogin(authResult) {
  scopes = authResult.scope || requestedScopes || "";

  // ...
}
```

Add a function called `userHasScopes` that checks for scopes in memory. Add an array of strings to the method. Check if the array of scopes saved in memory contains those values.
You can use this method to conditionally hide and show UI elements to the user and to limit route access.

```js
// app.js

function userHasScopes(requiredScopes) {
  if (!scopes) return false;
  var grantedScopes = scopes.split(" ");
  for (var i = 0; i < requiredScopes.length; i++) {
    if (grantedScopes.indexOf(requiredScopes[i]) < 0) {
      return false;
    }
  }
  return true;
}
```

## Conditionally Display UI Elements

You can use the `userHasScopes` function with the `isAuthenticated` function to show and hide certain UI elements.

```js
// app.js

// ...
function displayButtons() {
  // ...
  if (!isAuthenticated || !userHasScopes(["write:messages"])) {
    adminViewBtn.style.display = "none";
  } else {
    adminViewBtn.style.display = "inline-block";
  }
}
```

## Protect Client-Side Routes

You may want to give access to some routes in your application only to authenticated users. You can check if the user is authenticated with the `userHasScopes` function.

Depending on the routing library you use, you apply the `userHasScopes` function differently.

Some routing libraries provide hooks which run a function before the route is activated. This kind of hook might be called something like `beforeEnter` or `onEnter`. This is a good place to run the `userHasScopes` function to check whether the user has the scopes required to enter the route.

## Conditionally Assign Scopes to Users

By default, when you register scopes in your API settings, all the scopes are immediately available and any user can request them.
If you want to handle access control, you need to create policies for deciding which users can get which scopes.

> **Note:** You can use Rules to create access policies. See the [Rules documentation](https://auth0.com/docs/rules) to learn how to use Rules to create scope policies.

### Considerations for Client-Side Access Control

For the access control on the application-side, the `scope` values that you get in local storage are only a clue that the user has those scopes. The user could manually adjust the scopes in local storage to access routes they shouldn't have access to.

On the other hand, to access data on your server, the user needs a valid Access Token. Any attempt to modify an Access Token invalidates the token. If a user tries to edit the payload of their Access Token to include different scopes, the token will lose its integrity and become useless.

You should not store your sensitive data application-side. Make sure you always request it from the server. Even if users manually navigate to a page they are not authorized to see, they will not get the relevant data from the server and your application will still be secure.

## What is Auth0?

Auth0 helps you to:

- Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
- Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
- Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
- Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
- Analytics of how, when and where users are logging in.
- Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](https://auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
