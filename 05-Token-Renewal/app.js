window.addEventListener('load', function() {
  var userProfile;
  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var tokenRenewalTimeout;

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: AUTH0_AUDIENCE,
    responseType: 'token id_token',
    scope: 'openid profile',
    leeway: 60
  });

  var loginStatus = document.querySelector('.container h4');
  var loginView = document.getElementById('login-view');
  var homeView = document.getElementById('home-view');
  var profileView = document.getElementById('profile-view');

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login');
  var logoutBtn = document.getElementById('btn-logout');

  var homeViewBtn = document.getElementById('btn-home-view');
  var profileViewBtn = document.getElementById('btn-profile-view');

  var renewTokenBtn = document.getElementById('btn-renew-token');
  var accessTokenMessage = document.getElementById('access-token-message');
  var tokenExpiryDate = document.getElementById('token-expiry-date');

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    profileView.style.display = 'none';
  });

  profileViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'inline-block';
    getProfile(function (err) {
      if (err) {
        return console.error(err);
      }

      displayProfile();
    });
  });

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    webAuth.authorize();
  });

  logoutBtn.addEventListener('click', logout);

  renewTokenBtn.addEventListener('click', function() {
    renewToken();
  });

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    scheduleRenewal();
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    clearTimeout(tokenRenewalTimeout);
    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function displayButtons() {
    var loginStatus = document.querySelector('.container h4');
    if (isAuthenticated()) {
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      profileViewBtn.style.display = 'inline-block';
      renewTokenBtn.style.display = 'inline-block';
      accessTokenMessage.style.display = 'inline-block';
      loginStatus.innerHTML =
        'You are logged in! You can now view your profile area.';
      tokenExpiryDate.innerHTML = JSON.stringify(new Date(expiresAt));
    } else {
      homeView.style.display = 'inline-block';
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      profileViewBtn.style.display = 'none';
      profileView.style.display = 'none';
      renewTokenBtn.style.display = 'none';
      accessTokenMessage.style.display = 'none';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
    }
  }

  function getProfile(cb) {
    // fetch profile if it doesn't already exist
    if (userProfile) {
      return cb();
    }

    var accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return cb(new Error('Access token must exist to fetch profile'));
    }

    webAuth.client.userInfo(accessToken, function(err, profile) {
      if (err) return cb(err);

      if (profile) {
        userProfile = profile;
      }
      cb();
    });  
  }
  
  function displayProfile() {
    // display the profile
    document.querySelector('#profile-view .nickname').innerHTML =
      userProfile.nickname;
    document.querySelector(
      '#profile-view .full-profile'
    ).innerHTML = JSON.stringify(userProfile, null, 2);
    document.querySelector('#profile-view img').src = userProfile.picture;
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        setSession(authResult);
        loginBtn.style.display = 'none';
        homeView.style.display = 'inline-block';
      } else if (err) {
        homeView.style.display = 'inline-block';
        console.log(err);
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        );
      }
      displayButtons();
    });
  }

  function renewToken() {
    webAuth.renewAuth(
      {
        audience: AUTH0_AUDIENCE,
        redirectUri: AUTH0_SILENT_AUTH_REDIRECT,
        usePostMessage: true
      },
      function(err, result) {
        if (err) {
          alert(
            'Could not get a new token using silent authentication. ' +
              err.description
          );
        } else {
          setSession(result);
          alert('Successfully renewed auth!');
        }
      }
    );
  }

  function scheduleRenewal() {
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    var delay = expiresAt - Date.now();
    if (delay > 0) {
      tokenRenewalTimeout = setTimeout(function() {
        renewToken();
      }, delay);
    }
  }

  handleAuthentication();
  scheduleRenewal();
});
