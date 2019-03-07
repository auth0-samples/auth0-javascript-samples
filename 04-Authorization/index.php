<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div id="loading">
    <img src="assets/loading.svg" alt="Loading spinner">
  </div>

  <div class="content">
    <nav class="navbar navbar-default">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">Auth0 - JavaScript</a>

          <button id="btn-home-view" class="btn btn-primary btn-margin">
              Home
          </button>

          <button id="btn-profile-view" class="btn btn-primary btn-margin">
              Profile
          </button>

          <button id="btn-ping-view" class="btn btn-primary btn-margin">
              Ping
          </button>

          <button id="btn-admin-view" class="btn btn-primary btn-margin">
              Admin
          </button>

          <button id="qsLoginBtn" class="btn btn-primary btn-margin">
              Log In
          </button>

          <button id="qsLogoutBtn" class="btn btn-primary btn-margin">
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

      <!-- profile view -->
      <div id="profile-view" class="panel panel-default profile-area">
        <div class="panel-heading"><h3>Profile</h3></div>
        <div class="panel-body">
          <img class="avatar" alt="avatar">
          <div>
            <label><i class="glyphicon glyphicon-user"></i> Nickname</label>
            <h3 class="nickname"></h3>
          </div>
          <pre class="full-profile"></pre>
        </div>
      </div>

      <!-- ping view -->
      <div id="ping-view">
        <h1>Make a Call to the Server</h1>

        <p id="call-private-message">
          Log in to call a private (secured) server endpoint.
        </p>

        <button id="btn-ping-public" class="btn btn-primary">
            Call Public
        </button>

        <button id="btn-ping-private" class="btn btn-primary">
            Call Private
        </button>

        <h2 id="ping-message"></h2>
      </div>

      <!-- admin view -->
      <div id="admin-view">
        <h2>You are an Admin!</h2>
        <p>Only users who have a <code>scope</code> of <code>write:messages</code> in their <code>access_token</code> can see this area.</p>

        <hr>

        <h3>Call an Admin endpoint</h3>

        <button id="btn-ping-admin" class="btn btn-primary">
            Post a Message
        </button>

        <h2 id="admin-message"></h2>
      </div>

    </main>
  </div>

  <script src="node_modules/auth0-js/build/auth0.js"></script>
  <script src="auth0-variables.js"></script>
  <script src="app.js"></script>
</body>
</html>
