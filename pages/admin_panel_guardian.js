checkPermission();

// Wylogowanie
function logout() {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
}

// Sprawdzanie uprawnień do wyświetlania strony
function checkPermission() {
  // Odszyfrowywanie
  // credit to @MetaTron on StackOverflow
  const decrypt = (salt, encoded) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) =>
      textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
  };

  // Odczytanie tokenu z localStorage
  const token = localStorage.getItem("token");
  if (token !== undefined && token !== null && token !== "") {
    const decodedToken = JSON.parse(decrypt("wmk", token));
    if (decodedToken.role === "administrator") {
      return null;
    } else {
      window.location.href = "../index.html";
    }
  } else {
    window.location.href = "../index.html";
  }
}
