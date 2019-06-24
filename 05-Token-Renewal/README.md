# Auth0 JavaScript Token Renewal

This sample demonstrates how to silently renew `access_token`s in a JavaScript application with Auth0.

## Getting Started

Create a new API in the [APIs section](https://manage.auth0.com/#/apis) and provide an identifier for it.

Clone the repo or download it from the JavaScript quickstart page in Auth0's documentation.

```bash
cd 05-Token-Renewal
npm install
```

## Set the Client ID, Domain, and API URL

If you download the sample from the quickstart page, it will come pre-populated with the **client ID** and **domain** for your application. If you clone the repo directly from Github, rename the `auth0-variables.js.example` file to `auth0-variables.js` and provide the **client ID** and **domain** there.

## Set Up `Allowed Web Origins` in the dashboard

In order to make `checkSession` work, you need to add the URL where the authorization request originates from, to the Allowed Web Origins list of your Auth0 client in the Dashboard under your client's Settings.

## Run the Application

The `serve` module provided with this sample can be run with the `start` command.

```bash
npm start
```

The application will be served at `http://localhost:3000`.

## Troubleshooting

If you see an error on renewal saying `login_required`, that means you may be using the Auth0 dev keys for whichever social login you're testing. You'll need to add your own keys for this to work.

## Run the Application With Docker

In order to run the example with docker you need to have `docker` installed.

You also need to set the environment variables as explained [previously](#set-the-client-id-domain-and-api-url).

Execute in command line `sh exec.sh` to run the Docker in Linux, or `.\exec.ps1` to run the Docker in Windows.

## Tutorial

### Token Lifetime

For security, keep the expiry time of a user's Access Token short.

When you create an API in the Auth0 dashboard, the default expiry time for browser flows is 7200 seconds (2 hours).

This short expiry time is good for security, but can affect user experience. To improve user experience, provide a way for your users to automatically get a new Access Token and keep their client-side session alive. You can do this with [Silent Authentication](/api-auth/tutorials/silent-authentication).

> **Note:** You can control the expiry time of an Access Token from the [APIs section](https://manage.auth0.com/#/apis). You can control the expiry time of an ID Token from the [Applications section](https://manage.auth0.com/#/applications). These settings are independent.

### Add Token Renewal

In the `app.js` file, add a function which calls the `checkSession` method from auth0.js. If the renewal is successful, use the existing `localLogin` method to set the new tokens in memory.

```js
// app.js

function renewTokens() {
  webAuth.checkSession({}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      localLogin(result);
    }
  });
}
```

The Access Token should be renewed when it expires. In this tutorial, the expiry time of the token is stored in memory as `expiresAt`.

> **Note:** You can define any timing mechanism you want. You can choose any library that handles timers. This example shows how to use a `setTimeout` call.

In the `app.js` file, add a variable called `tokenRenewalTimeout`. The variable refers to the `setTimeout` call used to schedule the renewal. Next, add a function called `scheduleRenewal` to set up the time when authentication is silently renewed.

The method subtracts the current time from the Access Token's expiry time and calculates delay.
The `setTimeout` call uses the calculated delay and makes a call to `renewTokens`.

The `setTimeout` call is assigned to the `tokenRenewalTimeout` property. When the user logs out, the timeout is cleared.

```js
// app.js

var tokenRenewalTimeout;
// ...
function scheduleRenewal() {
  var delay = expiresAt - Date.now();
  if (delay > 0) {
    tokenRenewalTimeout = setTimeout(function() {
      renewTokens();
    }, delay);
  }
}
```

You can now include a call to the `scheduleRenewal` method in the `localLogin` function.

```js
// app.js

// ...
function localLogin(authResult) {
  // Set isLoggedIn flag in localStorage
  localStorage.setItem("isLoggedIn", "true");
  // Set the time that the Access Token will expire at
  expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );
  accessToken = authResult.accessToken;
  idToken = authResult.idToken;
  scheduleRenewal();
}
```

To schedule renewing the tokens when the page is refreshed, add a call to the `scheduleRenewal` method immediately when the page loads.

```js
// app.js

window.addEventListener("load", function() {
  // ...
  scheduleRenewal();
});
```

Since client-side sessions should not be renewed after the user logs out, use `clearTimeout` in the `logout` method to cancel the renewal.

```js
// app.js

function logout() {
  // ...
  clearTimeout(tokenRenewalTimeout);
}
```

## Troubleshooting APIs

For more information on troubleshooting backend APIs and tokens, please see the [documentation for your technology stack](https://auth0.com/docs/quickstart/backend).

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
