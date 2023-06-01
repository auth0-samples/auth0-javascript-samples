import { auth0Client, requireAuth, login } from "./auth0-client.js";
import {
  showContentFromUrl,
  updateUI,
  isRouteLink,
  eachElement,
} from "./ui.js";

/**
 * Calls the API endpoint with an authorization token
 */
const callApi = async () => {
  try {
    const token = await auth0Client.getTokenSilently();

    const response = await fetch("/api/external", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    const responseElement = document.getElementById("api-call-result");

    responseElement.innerText = JSON.stringify(responseData, {}, 2);

    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

    eachElement(".result-block", (c) => c.classList.add("show"));
  } catch (e) {
    console.error(e);
  }
};

// Will run when page finishes loading because of defer
// If unable to parse the history hash, default to the root URL
if (!showContentFromUrl(window.location.pathname)) {
  showContentFromUrl("/");
  window.history.replaceState({ url: "/" }, {}, "/");
}

const bodyElement = document.getElementsByTagName("body")[0];

// Listen out for clicks on any hyperlink that navigates to a #/ URL
bodyElement.addEventListener("click", (e) => {
  if (isRouteLink(e.target)) {
    const url = e.target.getAttribute("href");

    if (showContentFromUrl(url)) {
      e.preventDefault();
      window.history.pushState({ url }, {}, url);
    }
  } else if (e.target.getAttribute("id") === "call-api") {
    e.preventDefault();
    callApi();
  }
});

const isAuthenticated = await auth0Client.isAuthenticated();

if (isAuthenticated) {
  console.log("> User is authenticated");
  window.history.replaceState({}, document.title, window.location.pathname);
  updateUI();
} else {
  console.log("> User not authenticated");

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");
    try {
      const result = await auth0Client.handleRedirectCallback();

      if (result.appState && result.appState.targetUrl) {
        showContentFromUrl(result.appState.targetUrl);
      }

      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  } else {
    login();
  }

  updateUI();
}
