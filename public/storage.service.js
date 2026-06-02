const tokenKey = "GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

function saveAccessToken(token) {
  localStorage.setItem(tokenKey, token);
}

function readAccessToken() {
  return localStorage.getItem(tokenKey);
}

function deleteAccessToken() {
  localStorage.removeItem(tokenKey);
}
