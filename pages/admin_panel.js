checkPermission();
var passwordRequirements;

getPasswordRequirements();
getUsers();

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

// Funkcja wyciągająca wymogi z BD
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

        document.getElementById("length").value = passwordRequirements.length;
        document.getElementById("uppercaseLetters").value =
          passwordRequirements.upperCase;
        document.getElementById("specialCharacters").value =
          passwordRequirements.specialCharacter;
      } else {
        alert("!! Nie można wyciągnąć ustawień hasła !!");
      }
    };
  };
}

// Wyciąganie użytkowników z BD do listy
function getUsers() {
  let db;
  const request = indexedDB.open("Cybersecurity");

  request.onerror = (event) => {
    alert("!!! Błąd bazy danych [get users] !!!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    // wymiana danych z BD
    const transaction = db.transaction(["users"]);
    // reprezentacja objectStore
    const objectStore = transaction.objectStore("users");
    // reprezentacja requestu
    const request = objectStore.getAll();

    request.onerror = (event) => {
      alert("!! Nie można wyciągnąć użytkowników !!");
    };

    request.onsuccess = (event) => {

      //Dynamiczne dodawanie podpunktów do listy w HTMLu
      var userLists = document.getElementById("users");
      
      if(request.result !== undefined && request.request !== null) {
        for (let i = 0; i < request.result.length; i++) {
          userLists.innerHTML += "<li>Uprawnienia : <b>" + request.result[i].role + "</b><br/>Nazwa użytkownika: <b>" + request.result[i].username + "</b><br/>Aktywny: <b>" + (request.result[i].active? "tak": "nie") + "</b></li>";
        }
      }

    };
  };
}

// Zmiana wymagań dla hasła
function changePasswordRequirements() {
  const length = document.getElementById("length").value;
  const upperCase = document.getElementById("uppercaseLetters").value;
  const specialCharacters = document.getElementById("specialCharacters").value;

  let db;
  const request = indexedDB.open("Cybersecurity");

  request.onerror = (event) => {
    alert("!!! Błąd bazy danych [change password requirements] !!!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    const objectStore = db
      .transaction(["password_requirements"], "readwrite")
      .objectStore("password_requirements");
    const request = objectStore.get(1);

    request.onsuccess = (event) => {
      // Odczytanie bieżącej wartości
      const requirements = event.target.result;

      // Update pól
      requirements.requirements.length = length;
      requirements.requirements.upperCase = upperCase;
      requirements.requirements.specialCharacter = specialCharacters;

      // Put this updated object back into the database.
      const requestUpdate = objectStore.put(requirements);
      requestUpdate.onerror = (event) => {
        alert("!! Nie udało się zapisać wymogów hasła !!");
      };
      requestUpdate.onsuccess = (event) => {
        alert("Zapisano nowe wymogi hasła");
      };
    };
  };
}
