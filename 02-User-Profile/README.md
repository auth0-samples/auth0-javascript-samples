# Auth0 JavaScript User Profile

This sample demonstrates how to get a user's profile using Auth0 in a JavaScript application.

## Getting Started

If you haven't already done so, [sign up](https://auth0.com) for your free Auth0 account and create a new client in the [dashboard](https://manage.auth0.com). Find the **domain** and **client ID** from the settings area and add the URL for your application to the **Allowed Callback URLs** box. If you are serving the application with the provided `serve` library, that URL is `http://localhost:3000`.

Clone the repo or download it from the JavaScript quickstart page in Auth0's documentation.

```bash
cd 02-User-Profile
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

## Tutorial

Most applications display profile information to authenticated users. Auth0 provides a `/userinfo` endpoint for that. When you send an Access Token to the endpoint, it returns a JSON object with information about the user. The information stored in that object depends on how the user logged in to your application.

To learn more about the information returned by the `/userinfo` endpoint, see the [/userinfo endpoint documentation](https://auth0.com/docs/api/authentication#get-user-info).

## Request the Profile Scope

To retrieve user information, request a scope of `openid profile` in the instance of the `auth0WebAuth` object.

```js
// app.js

var webAuth = new auth0.WebAuth({
  // ...
  scope: "openid profile"
});
```

## Retrieve User Information

Use the `client.userInfo` method from the auth0.js library to get user information from the `/userinfo` endpoint.

Use the following arguments in the `client.userInfo` method:

1. The user's Access Token
2. A callback function with arguments for a potential error and a profile

Add a function which calls `client.userInfo` to the `Auth` service.

```js
// app.js

var userProfile;

function getProfile() {
  if (!userProfile) {
    if (!accessToken) {
      console.log("Access Token must exist to fetch profile");
    }

    webAuth.client.userInfo(accessToken, function(err, profile) {
      if (profile) {
        userProfile = profile;
        displayProfile();
      }
    });
  } else {
    displayProfile();
  }
}

function displayProfile() {
  // display the profile
  document.querySelector("#profile-view .nickname").innerHTML =
    userProfile.nickname;

  document.querySelector(
    "#profile-view .full-profile"
  ).innerHTML = JSON.stringify(userProfile, null, 2);

  document.querySelector("#profile-view img").src = userProfile.picture;
}
```

The service includes a local `userProfile` member that caches the profile information you requested with the `getProfile` call.

## Add a Profile Template

Add a template to display the user's profile.

```html
<!-- index.html -->

<main class="container">
  <!-- home view -->
  <div id="home-view">
    <h4></h4>
  </div>

  <!-- profile view -->
  <div id="profile-view" class="panel panel-default profile-area">
    <div class="panel-heading"><h3>Profile</h3></div>
    <div class="panel-body">
      <img class="avatar" alt="avatar" />
      <div>
        <label><i class="glyphicon glyphicon-user"></i> Nickname</label>
        <h3 class="nickname"></h3>
      </div>
      <pre class="full-profile"></pre>
    </div>
  </div>
</main>
```

## Allow Users to Update Their Profile

You can allow your users to update their profile information. Auth0 provides a `user_metadata` object to store information that users can edit. See [Metadata](https://auth0.com/docs/users/concepts/overview-user-metadata) for more information.

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
