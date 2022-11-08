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
          if (request.result.password === password) {
            console.log(request.result)
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

//function validateUser(username, password) {
//
//   var request = new XMLHttpRequest();
//   request.open("GET", "./fakeapi/users.json", false);
//   request.overrideMimeType("application/json");
//   request.send(null);
//   var usersJson = JSON.parse(request.responseText);
//   console.log(usersJson);

//   // $.getJSON("./fakeapi/users.json", function(json) {
//   //     console.log(json);
//   // })
//}

// funkcja do tworzenia BD w przeglądarce (indexedDB)

function createDataBase() {
  var db;
  const request = indexedDB.open("Cybersecurity");
  request.onerror = (event) => {
    alert("!!! Nie udało się połączyć z bazą danych !!!");
  };
  request.onsuccess = (event) => {
    db = event.target.result;
  };

  // zdarzenie aktualizacji bazy
  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Stworzenie objectStore dla bazy danych
    const objectStore = db.createObjectStore("users", { keyPath: "username" });
    objectStore.createIndex("username", "username", { unique: true });
    objectStore.createIndex("password", "password", { unique: false });
    objectStore.createIndex("role", "role", { unique: false });
    objectStore.createIndex("active", "active", { unique: false });

    objectStore.transaction.oncomplete = (event) => {
      // Dodanie rekordów
      const usersObjectStore = db
        .transaction("users", "readwrite")
        .objectStore("users");

      usersObjectStore.add({
        username: "user",
        password: "password1",
        role: "user",
        active: true
      });
      usersObjectStore.add({
        username: "user2",
        password: "password1",
        role: "user",
        active: false
      });
      usersObjectStore.add({
        username: "admin",
        password: "password2",
        role: "administrator",
        active: true
      });
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