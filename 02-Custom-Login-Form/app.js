window.addEventListener('load', function() {
  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'https://' + AUTH0_DOMAIN + '/userinfo',
    responseType: 'token id_token',
    scope: 'openid'
  });

  var loginStatus = document.querySelector('.container h4');
  var loginView = document.getElementById('login-view');
  var homeView = document.getElementById('home-view');

  // buttons and event listeners
  var homeViewBtn = document.getElementById('btn-home-view');
  var loginViewBtn = document.getElementById('btn-login-view');
  var logoutBtn = document.getElementById('btn-logout');

  var loginBtn = document.getElementById('btn-login');
  var signupBtn = document.getElementById('btn-signup');
  var googleLoginBtn = document.getElementById('btn-google-login');

  var authForm = document.getElementById('auth-form');

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    loginView.style.display = 'none';
  });

  loginViewBtn.addEventListener('click', function() {
    loginView.style.display = 'inline-block';
    homeView.style.display = 'none';
  });

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    login(email, password);
  });

  signupBtn.addEventListener('click', function() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    signup(email, password);
  });

  logoutBtn.addEventListener('click', logout);

  googleLoginBtn.addEventListener('click', loginWithGoogle);

  function login(username, password) {
    webAuth.client.login(
      {
        realm: 'Username-Password-Authentication',
        username: username,
        password: password
      },
      function(err, data) {
        if (err) {
          console.log(err);
          alert(
            'Error: ' + err.description + '. Check the console for further details.'
          );
          return;
        }
        setSession(data);
        authForm.reset();
        loginView.style.display = 'none';
        homeView.style.display = 'inline-block';
        displayButtons();
      }
    );
  }

  function signup(email, password) {
    webAuth.redirect.signupAndLogin(
      {
        connection: 'Username-Password-Authentication',
        email: email,
        password: password
      },
      function(err) {
        if (err) {
          console.log(err);
          alert(
            'Error: ' + err.description + '. Check the console for further details.'
          );
          return;
        }
      }
    );
  }

  function loginWithGoogle() {
    webAuth.authorize({
      connection: 'google-oauth2'
    });
  }

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function displayButtons() {
    if (isAuthenticated()) {
      loginViewBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      loginStatus.innerHTML = 'You are logged in!';
    } else {
      loginViewBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
    }
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        setSession(authResult);
        authForm.reset();
        loginView.style.display = 'none';
        homeView.style.display = 'inline-block';
      } else if (err) {
        console.log(err);
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        );
      }
      displayButtons();
    });
  }

  handleAuthentication();
});
