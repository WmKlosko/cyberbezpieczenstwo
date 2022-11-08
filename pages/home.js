var userInfo;
var passwordRequirements;

checkPermission();
getUserInformation();
getPasswordRequirements();

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
    userInfo = decodedToken;
    if (decodedToken.role === "user" || decodedToken.role === "administrator") {
      return null;
    } else {
      window.location.href = "../index.html";
    }
  } else {
    window.location.href = "../index.html";
  }
}

function getUserInformation() {
  if (userInfo.password_changed === false) {
    document.getElementById("password").style.visibility = "visible";
    document.getElementById("content").style.visibility = "hidden";
  } else {
    document.getElementById("password").style.visibility = "hidden";
    document.getElementById("content").style.visibility = "visible";
  }
}

function changePassword() {
  const password = document.getElementById("change_password").value;

  let db;
  const request = indexedDB.open("Cybersecurity");

  request.onerror = (event) => {
    alert("!!! Błąd bazy danych [change password] !!!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    const objectStore = db
      .transaction(["users"], "readwrite")
      .objectStore("users");
    const request = objectStore.get(userInfo.username);

    request.onsuccess = (event) => {
      // Odczytanie bieżącej wartości
      const user = event.target.result;

      const valid = validatePassword();

      if (user.password === password) {
        alert(" Nie możesz użyć tego samego hasła!");
      } else if (valid === true) {
        // Update pól
        user.password = crypt("wmk", password);
        user.password_changed = true;

        //Put this updated object back into the database.
        const requestUpdate = objectStore.put(user);
        requestUpdate.onerror = (event) => {
          alert("!! Nie udało się zmienić hasła !!");
        };
        requestUpdate.onsuccess = (event) => {
          alert("Zmieniono hasło");
          createToken(user);
          
          document.getElementById("password").style.visibility = "hidden";
          document.getElementById("content").style.visibility = "visible";
        };
      }
    };
  };
}

function getPasswordRequirements() {
  let db;
  const request = indexedDB.open("Cybersecurity");

  request.onerror = (event) => {
    alert("!!! Błąd bazy danych [password requirements] !!!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    // wymiana danych z BD
    const transaction = db.transaction(["password_requirements"]);
    // reprezentacja objectStore
    const objectStore = transaction.objectStore("password_requirements");
    // reprezentacja requestu
    const request = objectStore.get(1);

    request.onerror = (event) => {
      alert("!! Nie można wyciągnąć ustawień hasła !!");
    };

    request.onsuccess = (event) => {
      if (request.result !== undefined) {
        passwordRequirements = request.result.requirements;

        document.getElementById("requirement_length").innerHTML =
          "Min. długość: " + passwordRequirements.length;
        document.getElementById("requirement_uppercase").innerHTML =
          "Min. liczba wielkich liter: " + passwordRequirements.upperCase;
        document.getElementById("requirement_special").innerHTML =
          "Min. liczba znaków specjalnych: " +
          passwordRequirements.specialCharacter;
      } else {
        alert("!! Nie można wyciągnąć ustawień hasła !!");
      }
    };
  };
}

function validatePassword() {
  var valid = true;
  var password = document.getElementById("change_password").value;

  if (password !== undefined && password !== "" && password !== null) {
    var specialCharactersRegexString =
      "(?:[^`!@#$%^&*\\-_=+'\\/.,]*[`!@#$%^&*\\-_=+'\\/.,]){" +
      passwordRequirements.specialCharacter +
      "}.*";

    var specialCharactersPattern = new RegExp(
      specialCharactersRegexString,
      "g"
    );

    var upperCaseRegexString =
      "(?:[^A-Z]*[A-Z]){" + passwordRequirements.upperCase + "}.*";

    var upperCasePattern = new RegExp(upperCaseRegexString, "g");

    if (password.length < passwordRequirements.length) {
      valid = false;
      alert("Hasło za krótkie");
    }

    if (!upperCasePattern.test(password)) {
      valid = false;
      alert(
        "Minimalna liczba wielkich liter: " + passwordRequirements.upperCase
      );
    }

    if (!specialCharactersPattern.test(password)) {
      valid = false;
      alert(
        "Minimalna liczba znaków specjalnych: " +
          passwordRequirements.specialCharacter
      );
    }
  } else {
    valid = false;
    alert("Hasło za krótkie");
  }

  return valid;
}

// funkcja szyfrująca
// credit to @MetaTron on StackOverflow
const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

function createToken(userData) {
  var token = crypt("wmk", JSON.stringify(userData));
  // Dodanie tokena do localStorage
  localStorage.setItem("token", token);
  return token;
}