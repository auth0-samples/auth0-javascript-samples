# Sample 01 - Login

The purpose of this article is to demonstrate how simple it is to set up and use the new Single Page Application SDK, and authenticate a user in your application using Auth0's Universal Login Page.

## Running the Sample Application

The sample can be run locally, by cloning the repository to your machine and then following the steps below.

### Prerequisites
- Docker
- docker-compose

### Specifying Auth0 Credentials

To specify the application client ID and domain, make a copy of `.env.example` and rename it to `.env`. Then open it in a text editor and supply the values for your application:

```bash
DOMAIN=<DOMAIN>
CLIENT_ID=<CLIENT_ID>
```

The application settings should then be updated so that login url, callback urls, logout urls, and allowed origins all are set to `https://foo.test`.

Finally add the desired connections, so that the user will actually be able to login.

### Add domain to hosts file
Auth0 requires ssl encyption, therefore we are use Caddy and reverse proxy to the web application. To make it possible for Caddy to proxy traffic coming in on https, we need to provide a domain. In order to resolver the domain, we need to add it to our `hosts` file'.

```bash
$ sudo echo '127.0.0.1 foo.test' >> /etc/hosts
```

### Start the server

```bash
$ docker-compose up
```

### Access the page
The application should now be accessible on https://foo.test

## Frequently Asked Questions

We are compiling a list of questions and answers regarding the new JavaScript SDK - if you're having issues running the sample applications, [check the FAQ](https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md)!

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

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
