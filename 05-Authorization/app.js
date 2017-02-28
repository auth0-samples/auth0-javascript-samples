window.addEventListener('load', function() {

  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var apiUrl = 'http://localhost:3001/api';

  var lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
    oidcConformant: true,
    autoclose: true,
    auth: {
      redirectUrl: AUTH0_CALLBACK_URL,
      responseType: 'token id_token',
      audience: API_ID,
      params: {
        scope: 'openid profile read:messages'
      }
    }
  });

  var userProfile;

  lock.on('authenticated', function(authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);
    } else if (authResult && authResult.error) {
      alert('Error: ' + authResult.error);
    }
    displayButtons();
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
    adminView.style.display = 'none';
    pingView.style.display = 'none';
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
    lock.show();
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
      loginStatus.innerHTML = 'You are logged in! You can now view your admin area.';
      profileViewBtn.style.display = 'inline-block';
      pingPrivate.style.display = 'inline-block';
      callPrivateMessage.style.display = 'none';
      if (isAdmin()) {
        adminViewBtn.style.display = 'inline-block';
      } else {
        adminViewBtn.style.display = 'none';
      }
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      profileViewBtn.style.display = 'none';
      profileView.style.display = 'none';
      adminViewBtn.style.display = 'none';
      adminView.style.display = 'none';
      pingPrivate.style.display = 'none';
      callPrivateMessage.style.display = 'block';
      loginStatus.innerHTML = 'You are not logged in! Please log in to continue.';
    }
  }

  function getProfile() {
    if (!userProfile) {
      var accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.log('Access token must exist to fetch profile');
      }

      lock.getUserInfo(accessToken, function(err, profile) {
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
    document.querySelector(
      '#profile-view .nickname'
    ).innerHTML = userProfile.nickname;
    document.querySelector(
      '#profile-view .full-profile'
    ).innerHTML = JSON.stringify(userProfile, null, 2);
    document.querySelector('#profile-view img').src = userProfile.picture;
  }

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
        document.querySelector('#ping-view h2').innerHTML = JSON.parse(
          xhr.responseText
        ).message;
      } else {
        alert('Request failed: ' + xhr.statusText);
      }
    };
    xhr.send();
  }

  function getRole() {
    var namespace = 'https://example.com';
    var idToken = localStorage.getItem('id_token');
    return jwt_decode(idToken)[namespace + '/role'] || null;
  }

  function isAdmin() {
    return getRole() === 'admin';
  }

  displayButtons();
});
