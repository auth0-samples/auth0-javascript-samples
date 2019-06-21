# Auth0 JavaScript Calling an API

This sample demonstrates how to make secure calls to an API after authenticating a user with Auth0. The calls to the API are made with the user's `access_token`.

## Getting Started

If you haven't already done so, [sign up](https://auth0.com) for your free Auth0 account and create a new client in the [dashboard](https://manage.auth0.com). Find the **domain** and **client ID** from the settings area and add the URL for your application to the **Allowed Callback URLs** box. If you are serving the application with the provided `serve` library, that URL is `http://localhost:3000`.

If you haven't already done so, create a new API in the [APIs section](https://manage.auth0.com/#/apis) and provide an identifier for it.

Clone the repo or download it from the JavaScript quickstart page in Auth0's documentation.

```bash
cd 03-Calling-an-API
npm install
```

## Set the Client ID, Domain, and API URL

If you download the sample from the quickstart page, it will come pre-populated with the **client ID** and **domain** for your application. If you clone the repo directly from Github, rename the `auth0-variables.js.example` file to `auth0-variables.js` and provide the **client ID** and **domain** there.

You should also provide the identifier for the API you create in the Auth0 dashboard as your `apiUrl`. At the same time you should define the expected value(`'read:messages'`) for the [required scope argument](https://github.com/auth0-samples/auth0-javascript-samples/blob/master/03-Calling-an-API/app.js#L17) in creating `auth0.WebAuth`.

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

Most single-page apps use resources from data APIs. You may want to restrict access to those resources, so that only authenticated users with sufficient privileges can access them. Auth0 lets you manage access to these resources using [API Authorization](/api-auth).

This tutorial shows you how to access protected resources in your API.

> **Note:** This tutorial does not show you how to add protection to your API. Read the [Backend/API quickstart documentation](https://auth0.com/docs/quickstart/backend) for instructions on how to protect your API.

### Create an API

In the [APIs section](https://manage.auth0.com/#/apis) of the Auth0 dashboard, click **Create API**. Provide a name and an identifier for your API.
You will use the identifier later when you're configuring your Javascript Auth0 application instance.
For **Signing Algorithm**, select **RS256**.

![Create API](/media/articles/api-auth/create-api.png)

### Add a Scope

By default, the Access Token does not contain any authorization information. To limit access to your resources based on authorization, you must use scopes. Read more about scopes in the [scopes documentation](https://auth0.com/docs/scopes).

In the Auth0 dashboard, in the [APIs section](https://manage.auth0.com/#/apis), click **Scopes**. Add any scopes you need to limit access to your API resources.

> **Note:** You can give any names to your scopes. A common pattern is `<action>:<resource>`. The example below uses the name `read:messages` for a scope.

## Configure your Application

In your `auth0.WebAuth` instance, enter your API identifier as the value for `audience`.
Add your scopes to the `scope` key.

```js
// app.js

var webAuth = new auth0.WebAuth({
  // ...
  audience: "YOUR AUTH0 API IDENTIFIER",
  scope: "openid profile read:messages"
});
```

### Checkpoint

Try to log in to your application again. Look at how the Access Token differs from before. It is no longer an opaque token. It is now a JSON Web Token with a payload that contains your API identifier as the value for `audience`, and the scopes you created. Read more about this token in the [JSON Web Tokens documentation](https://auth0.com/docs/jwt).

> **Note:** By default, any user can ask for any scope you defined. You can implement access policies to limit this behavior using [Rules](https://auth0.com/docs/rules).

## Configure a Custom XHR Request

To give the authenticated user access to secured resources in your API, include the user's Access Token in the requests you send to your API.
There are two common ways to do this.

- Store the Access Token in a cookie. The Access Token is then included in all requests.
- Send `access_token` in the `Authorization` header using the `Bearer` scheme.

> **Note:** The examples below use the `Bearer` scheme.

To attach the user's Access Token to HTTP calls as an `Authorization` header, add the header as an option to your requests.

> **Note:** We recommend you implement a custom function which adds the header automatically.

Create a new function called `callAPI`. The function wraps an XHR request with the user's Access Token included as the `Authorization` header.

```js
// app.js

var apiUrl = "http://localhost:3001/api";

// ...
function callAPI(endpoint, secured) {
  var url = apiUrl + endpoint;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  if (secured) {
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  }
  xhr.onload = function() {
    if (xhr.status == 200) {
      // update message
      document.querySelector("#ping-view h2").innerHTML = JSON.parse(
        xhr.responseText
      ).message;
    } else {
      alert("Request failed: " + xhr.statusText);
    }
  };
  xhr.send();
}
```

## Protect Your API Resources

To restrict access to the resources served by your API, check the incoming requests for valid authorization information.
The authorization information is in the Access Token created for the user. To see if the token is valid, check it against the [JSON Web Key Set (JWKS)](https://auth0.com/docs/jwks) for your Auth0 account. To learn more about validating Access Tokens, read the [Verify Access Tokens tutorial](https://auth0.com/docs/api-auth/tutorials/verify-access-token).

In each language and framework, you verify the Access Token differently.
Typically, you use a middleware function to verify the token. If the token is valid, the request proceeds and the user gets access to resources in your API. If the token is invalid, the request is rejected with a `401 Unauthorized` error.

> **Note:** The sample project shows how to implement this functionality using Node.js with the Express framework. To learn how to implement API protection for your server-side technology, see the [Backend/API quickstart documentation](https://auth0.com/docs/quickstart/backend).

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
