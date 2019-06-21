# Auth0 JavaScript Login

This sample demonstrates how to add authentication to a JavaScript application with Auth0. The sample makes use of Auth0's hosted login page which provides centralized authentication.

## Getting Started

If you haven't already done so, [sign up](https://auth0.com) for your free Auth0 account and create a new client in the [dashboard](https://manage.auth0.com). Find the **domain** and **client ID** from the settings area and add the URL for your application to the **Allowed Callback URLs** box. If you are serving the application with the provided `serve` library, that URL is `http://localhost:3000`.

Clone the repo or download it from the JavaScript quickstart page in Auth0's documentation.

```bash
cd 01-Login
npm install
```

## Set the Client ID and Domain

If you download the sample from the quickstart page, it will come pre-populated with the **client ID** and **domain** for your application. If you clone the repo directly from Github, rename the `auth0-variables.js.example` file to `auth0-variables.js` and provide the **client ID** and **domain** there.

## Run the Application

The `serve` module provided with this sample can be run with the `start` command.

```bash
npm start
```

The application will be served at `http://localhost:3000`.

## Run the Application With Docker

In order to run the example with docker you need to have `docker` installed.

You also need to set the environment variables as explained [previously](#set-the-client-id-and-domain).

Execute in command line `sh exec.sh` to run the Docker in Linux, or `.\exec.ps1` to run the Docker in Windows.

## Running the Tests

**Pre-Conditions:**

- Make sure you meet the requirements detailed in the [auth0-quickstarts-tester](https://www.npmjs.com/package/auth0-quickstarts-tester#requirements) package. Python, CasperJS, PhantomJS and Docker Desktop must be installed in your host.
- Edit the `auth0-variables.js.example` file adding your own credentials. Rename the file to `auth0-variables.js`.
- Edit the `test.js` file and set a valid pair of `user` and `password` credentials, used to log in into the app.

Run the test:

```bash
npm test
```

## Tutorial

### Create an Authentication Service

Add a new file called `app.js`. In the file, you can create and manage an instance of the `auth0.WebAuth` object. In that instance, you can define the following:

- Configuration for your application and domain
- Response type, to show that you need a user's Access Token and an ID Token after authentication
- Audience and scope, specifying that you need an `access_token` that can be used to invoke the [/userinfo endpoint](https://auth0.com/docs/api/authentication#get-user-info).
- The URL where you want to redirect your users after authentication.

> **Note:** In this case, the route is the main URL for your application.

You can also use it to hold logic for hiding and displaying DOM elements.

```js
// app.js

window.addEventListener("load", function() {
  var idToken;
  var accessToken;
  var expiresAt;

  var webAuth = new auth0.WebAuth({
    domain: "${account.namespace}",
    clientID: "${account.clientId}",
    responseType: "token id_token",
    scope: "openid",
    redirectUri: window.location.href
  });

  var loginBtn = document.getElementById("btn-login");

  loginBtn.addEventListener("click", function(e) {
    e.preventDefault();
    webAuth.authorize();
  });
});
```

### Checkpoint

Try to add a button with the `btn-login` ID to your app. This will call the `authorize` method from auth0.js so you can see the login page.

## Handle Authentication Tokens

Add more functions to the `app.js` file to handle authentication in the app.

The example below shows the following functions:

- `handleAuthentication`: looks for the result of authentication in the URL hash and processes it with the `parseHash` method from auth0.js.
- `renewTokens`: performs silent authentication to renew the session.
- `localLogin`: sets the user's Access Token, ID Token, and the Access Token's expiry time.
- `logout`: removes the user's tokens and expiry time from browser memory. It also calls webAuth.logout to log the user out at the authorization server.
- `isAuthenticated`: checks whether the expiry time for the user's Access Token has passed.

```js
// app.js

window.addEventListener("load", function() {
  // ...
  var loginStatus = document.querySelector(".container h4");
  var loginView = document.getElementById("login-view");
  var homeView = document.getElementById("home-view");

  // buttons and event listeners
  var homeViewBtn = document.getElementById("btn-home-view");
  var loginBtn = document.getElementById("btn-login");
  var logoutBtn = document.getElementById("btn-logout");

  homeViewBtn.addEventListener("click", function() {
    homeView.style.display = "inline-block";
    loginView.style.display = "none";
  });

  logoutBtn.addEventListener("click", logout);

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = "";
        localLogin(authResult);
        loginBtn.style.display = "none";
        homeView.style.display = "inline-block";
      } else if (err) {
        homeView.style.display = "inline-block";
        console.log(err);
        alert(
          "Error: " + err.error + ". Check the console for further details."
        );
      }
      displayButtons();
    });
  }

  function localLogin(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem("isLoggedIn", "true");
    // Set the time that the Access Token will expire at
    expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    accessToken = authResult.accessToken;
    idToken = authResult.idToken;
  }

  function renewTokens() {
    webAuth.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        localLogin(authResult);
      } else if (err) {
        alert(
          "Could not get a new token " +
            err.error +
            ":" +
            err.error_description +
            "."
        );
        logout();
      }
      displayButtons();
    });
  }

  function logout() {
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem("isLoggedIn");
    // Remove tokens and expiry time
    accessToken = "";
    idToken = "";
    expiresAt = 0;

    webAuth.logout({
      return_to: window.location.origin
    });

    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    var expiration = parseInt(expiresAt) || 0;
    return (
      localStorage.getItem("isLoggedIn") === "true" &&
      new Date().getTime() < expiration
    );
  }

  function displayButtons() {
    if (isAuthenticated()) {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      loginStatus.innerHTML = "You are logged in!";
    } else {
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
      loginStatus.innerHTML =
        "You are not logged in! Please log in to continue.";
    }
  }
});
```

### Provide a Login Control

Provide a template with controls for the user to log in and out.

```html
<!-- index.html -->

<div class="content">
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="#">Auth0 - JavaScript</a>

        <button id="btn-home-view" class="btn btn-primary btn-margin">
          Home
        </button>

        <button id="btn-login" class="btn btn-primary btn-margin">
          Log In
        </button>

        <button id="btn-logout" class="btn btn-primary btn-margin">
          Log Out
        </button>
      </div>
    </div>
  </nav>

  <main class="container">
    <!-- home view -->
    <div id="home-view">
      <h4></h4>
    </div>
  </main>
</div>
```

> **Note:** This example uses Bootstrap styles. You can use any style library, or not use one at all.

Depending on whether the user is authenticated or not, they see the **Log In** or **Log Out** button. The `click` event listeners on the buttons make calls to functions in the `app.js` file to let the user log in or out. When the user clicks **Log In**, they are redirected to the login page.

> **Note:** The login page uses the Lock widget. To learn more about Universal Login and the login page, see the [Universal Login documentation](https://auth0.com/docs/hosted-pages/login). To customize the look and feel of the Lock widget, see the [Lock customization options documentation](https://auth0.com/docs/libraries/lock/v10/customization).

### Process the Authentication Result

When a user authenticates at the login page, they are redirected to your application. Their URL contains a hash fragment with their authentication information. The `handleAuthentication` method in the `app.js` file processes the hash.

Call the `handleAuthentication` method in the `app.js` file. The method processes the authentication hash while your app loads.

```js
// app.js

window.addEventListener("load", function() {
  // ...
  if (localStorage.getItem("isLoggedIn") === "true") {
    renewTokens();
  } else {
    handleAuthentication();
  }
});
```

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
