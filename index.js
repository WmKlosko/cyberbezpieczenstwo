createDataBase();

function login() {
  console.log("logowanie");

  const username = document.getElementById("user").value;
  const password = document.getElementById("password").value;

  validateUser(username, password);
}

// Sprawdzanie loginu i hasła użytkownika
function validateUser(username, password) {
  let db;
  const request = indexedDB.open("Cybersecurity");

  request.onerror = (event) => {
    alert("!!! Błąd bazy danych [validate user] !!!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    // wymiana danych z BD
    const transaction = db.transaction(["users"]);
    // reprezentacja objectStore
    const objectStore = transaction.objectStore("users");
    // reprezentacja requestu
    const request = objectStore.get(username);

    request.onerror = (event) => {
      alert("!! Nie można wyciągnąć danych użytkownika !!");
    };

    request.onsuccess = (event) => {
      if (request.result !== undefined) {
        
        var decodedPassword = decrypt('wmk', request.result.password);

        if (decodedPassword === password) {
          console.log(request.result);
          // tworzenie tokenu do autoryzacji
          createToken(request.result);
          // funkcja do przekierowania na stronę startową
          redirect(request.result.role);
        } else {
          alert("Nieprawidłowe hasło");
        }
      } else {
        alert("Nie ma takiego użytkownika !");
      }
    };
  };
}

// Przekierowanie na podstawie roli użytkownika
function redirect(role) {
  if (role === "user") {
    window.location.href = "./pages/home.html";
  } else if (role === "administrator") {
    window.location.href = "./pages/admin_panel.html";
  }
}

// Tworzenie tokena autoryzacji
function createToken(userData) {
  var token = crypt("wmk", JSON.stringify(userData));
  // Dodanie tokena do localStorage
  localStorage.setItem("token", token);
  return token;
}

// IMITACJA API

// funkcja do tworzenia BD w przeglądarce (indexedDB)
function createDataBase() {
  var db;
  var request = indexedDB.open("Cybersecurity");
  request.onerror = (event) => {
    alert("!!! Nie udało się połączyć z bazą danych !!!");
  };

  // zdarzenie aktualizacji bazy
  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Stworzenie objectStore dla bazy danych (użytkownicy)
    const objectStore = db.createObjectStore("users", { keyPath: "username" });

    // Stworzenie tabeli dla użytkowników
    objectStore.createIndex("username", "username", { unique: true });

    // Stworzenie objectStore dla bazy danych (wymogi hasła)
    const objectStorePassword = db.createObjectStore("password_requirements", {
      keyPath: "id",
    });

    // Stworzenie tabeli dla wymogów hasła
    objectStorePassword.createIndex("id", "id", { unique: true });

    var transaction = event.target.transaction;

    // Dodanie rekordów dla użytkowników
    var usersTransaction = transaction.objectStore("users");
    usersTransaction.add({
      username: "user",
      password: "01100202061e031540",
      role: "user",
      active: true,
      password_changed: false,
    });
    usersTransaction.add({
      username: "user2",
      password: "01100202061e031540",
      role: "user",
      active: false,
      password_changed: false,
    });
    usersTransaction.add({
      username: "admin",
      password: "01100202061e031543",
      role: "administrator",
      active: true,
      password_changed: true,
    });

    // Dodanie rekordu dla wymogów hasła
    var passwordTransaction = transaction.objectStore("password_requirements");
    passwordTransaction.add({
      id: 1,
      requirements: {
        length: 8,
        upperCase: 1,
        specialCharacter: 1,
      },
    });
  };
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

// funkcja odszyfrująca
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
