window.addEventListener('load', function() {
  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var userProfile;
  var apiUrl = 'http://localhost:3001/api';
  var requestedScopes = 'openid profile read:messages write:messages';

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: AUTH0_AUDIENCE,
    responseType: 'token id_token',
    scope: requestedScopes,
    leeway: 60
  });

  var homeView = document.getElementById('home-view');
  var profileView = document.getElementById('profile-view');
  var pingView = document.getElementById('ping-view');
  var adminView = document.getElementById('admin-view');

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login');
  var logoutBtn = document.getElementById('btn-logout');

  var homeViewBtn = document.getElementById('btn-home-view');
  var profileViewBtn = document.getElementById('btn-profile-view');
  var pingViewBtn = document.getElementById('btn-ping-view');
  var adminViewBtn = document.getElementById('btn-admin-view');

  var pingPublic = document.getElementById('btn-ping-public');
  var pingPrivate = document.getElementById('btn-ping-private');
  var pingAdmin = document.getElementById('btn-ping-admin');

  var callPrivateMessage = document.getElementById('call-private-message');
  var pingMessage = document.getElementById('ping-message');
  var adminMessage = document.getElementById('ping-message');

  pingPublic.addEventListener('click', function() {
    callAPI('/public', false, 'GET', function(err, response) {
      if (err) {
        alert(err);
        return;
      }
      // update message
      document.querySelector('#ping-message').innerHTML = response;
    });
  });

  pingPrivate.addEventListener('click', function() {
    callAPI('/private', true, 'GET', function(err, response) {
      if (err) {
        alert(err);
        return;
      }
      // update message
      document.querySelector('#ping-message').innerHTML = response;
    });
  });

  pingAdmin.addEventListener('click', function() {
    callAPI('/admin', true, 'POST', function(err, response) {
      if (err) {
        alert(err);
        return;
      }
      // update message
      document.querySelector('#admin-message').innerHTML = response;
    });
  });

  loginBtn.addEventListener('click', login);
  logoutBtn.addEventListener('click', logout);

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    profileView.style.display = 'none';
    pingView.style.display = 'none';
    adminView.style.display = 'none';
  });

  profileViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    pingView.style.display = 'none';
    adminView.style.display = 'none';
    profileView.style.display = 'inline-block';
    getProfile();
  });

  pingViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'none';
    adminView.style.display = 'none';
    pingView.style.display = 'inline-block';
  });

  adminViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'none';
    pingView.style.display = 'none';
    adminView.style.display = 'inline-block';
  });

  function login() {
    webAuth.authorize();
  }

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    // If there is a value on the `scope` param from the authResult,
    // use it to set scopes in the session for the user. Otherwise
    // use the scopes as requested. If no scopes were requested,
    // set it to nothing
    const scopes = authResult.scope || requestedScopes || '';

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('scopes', JSON.stringify(scopes));
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('scopes');
    pingMessage.style.display = 'none';
    adminMessage.style.display = 'none';
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
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      pingViewBtn.style.display = 'inline-block';
      profileViewBtn.style.display = 'inline-block';
      pingPrivate.style.display = 'inline-block';
      callPrivateMessage.style.display = 'none';
      loginStatus.innerHTML =
        'You are logged in! You can now view your admin area.';
    } else {
      homeView.style.display = 'inline-block';
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      profileViewBtn.style.display = 'none';
      profileView.style.display = 'none';
      pingViewBtn.style.display = 'none';
      adminView.style.display = 'none';
      pingView.style.display = 'none';
      pingPrivate.style.display = 'none';
      callPrivateMessage.style.display = 'block';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
    }
    if (!isAuthenticated || !userHasScopes(['write:messages'])) {
      adminViewBtn.style.display = 'none';
    } else {
      adminViewBtn.style.display = 'inline-block';
    }
  }

  function getProfile() {
    if (!userProfile) {
      var accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.log('Access token must exist to fetch profile');
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

  function userHasScopes(scopes) {
    var savedScopes = JSON.parse(localStorage.getItem('scopes'));
    if (!savedScopes) return false;
    var grantedScopes = savedScopes.split(' ');
    for (var i = 0; i < scopes.length; i++) {
      if (grantedScopes.indexOf(scopes[i]) < 0) {
        return false;
      }
    }
    return true;
  }

  handleAuthentication();

  function callAPI(endpoint, secured, method, cb) {
    var url = apiUrl + endpoint;
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (secured) {
      xhr.setRequestHeader(
        'Authorization',
        'Bearer ' + localStorage.getItem('access_token')
      );
    }
    xhr.onload = function() {
      if (xhr.status == 200) {
        var message = JSON.parse(xhr.responseText).message;
        cb(null, message);
      } else {
        cb(xhr.statusText);
      }
    };
    xhr.send();
  }

  displayButtons();
});
