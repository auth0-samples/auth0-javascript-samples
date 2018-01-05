var QSTester = require("auth0-quickstarts-tester");

//Change the values below to match an existing database user on the Test Client
var testParameters = {
    url: "http://localhost:3000",
    user: "email@test.com",
    password: "testpwd"
  };
new QSTester().runOnPath(".", testParameters)
  .then(() => process.exit());