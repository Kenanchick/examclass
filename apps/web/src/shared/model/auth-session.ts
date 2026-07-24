const authSessionChangeEvent = "examclass:auth-session-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function notifySessionChange() {
  if (isBrowser()) {
    window.dispatchEvent(new Event(authSessionChangeEvent));
  }
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem("accessToken");
}

export function setAccessToken(accessToken: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem("accessToken", accessToken);
  notifySessionChange();
}

export function clearAccessToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem("accessToken");
  notifySessionChange();
}

export { authSessionChangeEvent };
