window.addEventListener('load', function() {

  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var userProfile;
  var apiUrl = 'http://localhost:3001/api';

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: AUTH0_AUDIENCE,
    responseType: 'token id_token',
    scope: 'openid profile read:messages',
    leeway: 60
  });

  var homeView = document.getElementById('home-view');
  var profileView = document.getElementById('profile-view');
  var pingView = document.getElementById('ping-view');

  // buttons and event listeners
  var loginBtn = document.getElementById('btn-login');
  var logoutBtn = document.getElementById('btn-logout');

  var homeViewBtn = document.getElementById('btn-home-view');
  var profileViewBtn = document.getElementById('btn-profile-view');
  var pingViewBtn = document.getElementById('btn-ping-view');

  var pingPublic = document.getElementById('btn-ping-public');
  var pingPrivate = document.getElementById('btn-ping-private');

  var callPrivateMessage = document.getElementById('call-private-message');
  var pingMessage = document.getElementById('ping-message');

  pingPublic.addEventListener('click', function() {
    callAPI('/public', false);
  });

  pingPrivate.addEventListener('click', function() {
    callAPI('/private', true);
  });

  loginBtn.addEventListener('click', login);
  logoutBtn.addEventListener('click', logout);

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    profileView.style.display = 'none';
    pingView.style.display = 'none';
  });

  profileViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    pingView.style.display = 'none';
    profileView.style.display = 'inline-block';
    getProfile(function (err) {
      if (err) {
        return console.error(err);
      }

      displayProfile();
    });
  });

  pingViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'none';
    pingView.style.display = 'inline-block';
  });

  function login() {
    webAuth.authorize();
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
    pingMessage.style.display = 'none';
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
      profileViewBtn.style.display = 'inline-block';
      pingViewBtn.style.display = 'inline-block';
      pingPrivate.style.display = 'inline-block';
      callPrivateMessage.style.display = 'none';
      loginStatus.innerHTML = 'You are logged in! You can now send authenticated requests to your server.';
    } else {
      homeView.style.display = 'inline-block';
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      profileViewBtn.style.display = 'none';
      profileView.style.display = 'none';
      pingView.style.display = 'none';
      pingViewBtn.style.display = 'none';
      pingPrivate.style.display = 'none';
      callPrivateMessage.style.display = 'block';
      loginStatus.innerHTML = 'You are not logged in! Please log in to continue.';
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
    document.querySelector(
      '#profile-view .nickname'
    ).innerHTML = userProfile.nickname;
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

  handleAuthentication();

  function callAPI(endpoint, secured) {
    var url = apiUrl + endpoint;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (secured) {
      xhr.setRequestHeader(
        'Authorization',
        'Bearer ' + localStorage.getItem('access_token')
      );
    }
    xhr.onload = function() {
      if (xhr.status == 200) {
        // update message
        document.querySelector('#ping-view h2').innerHTML = JSON.parse(
          xhr.responseText
        ).message;
      } else {
        alert('Request failed: ' + xhr.statusText);
      }
    };
    xhr.send();
  }

  displayButtons();
});
