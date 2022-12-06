var captchaQuestions = [];
var currentQuestion = 0;
var allQuestionsAnswered = false;
var uploadField = document.getElementById("file-upload");

document.getElementById("login").style.display = "none";

createDataBase();
getCaptchaQuestions();

// Sprawdza, czy plik ma odpowiedni rozmiar
uploadField.onchange = function () {
  if (this.files[0].size > 102400) {
    alert("Plik jest za ciężki!");
    this.value = "";
  }
};

function szyfrujCezar() {
  const inputValue = document.getElementById("CEZAR").value;
  if (inputValue != "" && inputValue != null && inputValue != undefined) {
    var outputValue = "";
    var alphabets =['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'," ", "-", "", ".", "&","?", "!", "@", "#", "/"];
    var alphabets13 = ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z','A','B','C','D','E','F','G','H','I','J','K','L','M', " ", "-", "", ".", "&","?", "!", "@", "#", "/"];

    var outputArray = [];
    for(let i=0; i<inputValue.length; i++){
        for(let j =0; j<alphabets.length; j++){
            if(inputValue[i].toUpperCase() === alphabets[j]){
            outputArray.push(alphabets13[j]);
            }
        }
    }
    outputValue = outputArray.join('');
    document.getElementById("Wynik_szyfrowania").innerHTML = outputValue;
  }
  else
  {
    alert("Nie może być pusty")
  }
}

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
        var decodedPassword = decrypt("wmk", request.result.password);

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

    // Stworzenie objectStore dla bazy danych (pytania captcha)
    const objectStoreCaptcha = db.createObjectStore("captcha", {
      keyPath: "id",
    });

    // Stworzenie tabeli dla pytań captcha
    objectStoreCaptcha.createIndex("captcha", "captcha", { unique: true });

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

    // Dodanie pytań dla captcha
    var captchaTransaction = transaction.objectStore("captcha");
    captchaTransaction.add({
      id: 1,
      question: "Ile to dwa dodać dwa? Podaj cyfrę",
      answer: "4",
    });
    captchaTransaction.add({
      id: 2,
      question: "Który rok będzie trzy lata po dwutysięcznym?",
      answer: "2003",
    });
    captchaTransaction.add({
      id: 3,
      question: "Jaki kolor ma niebieska farba?",
      answer: "niebieski",
    });
    captchaTransaction.add({
      id: 4,
      question: "Która cyfra jest po czwórce?",
      answer: "5",
    });
    captchaTransaction.add({
      id: 5,
      question: "Podaj ostatnie słowo tego zdania",
      answer: "zdania",
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

// funkcja deszyfrująca
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

// Sprawdzanie odpowiedzi wprowadzonej przez użytkownika
function captchaCheck(index) {
  const answer = document.getElementById("answer").value;
  var captcha = captchaQuestions[index];
  var result = false;
  if (answer) {
    if (answer.trim().toLowerCase() === captcha.answer) {
      result = true;
    } else {
      alert("Błędna odpowiedź");
    }
  }
  if (result === true) {
    document.getElementById("answer").value = "";
    currentQuestion++;
    if (currentQuestion > 2) {
      allQuestionsAnswered = true;
      document.getElementById("captcha").style.display = "none";
      document.getElementById("login").style.display = "block";
    } else {
      document.getElementById("iteration").innerHTML = currentQuestion + 1;
      var questionDiv = document.getElementById("question");
      questionDiv.innerHTML = captchaQuestions[currentQuestion].question;
    }
  }
}

// odczytywanie pytań "captcha" z bazy danych
function getCaptchaQuestions() {
  let db;
  const request = indexedDB.open("Cybersecurity");

  request.onerror = (event) => {
    alert("!!! Błąd bazy danych [captcha] !!!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    // wymiana danych z BD
    const transaction = db.transaction(["captcha"]);
    // reprezentacja objectStore
    const objectStore = transaction.objectStore("captcha");
    // reprezentacja requestu
    const request = objectStore.getAll();

    request.onerror = (event) => {
      alert("!! Nie można wyciągnąć pytań captcha !!");
    };

    request.onsuccess = (event) => {
      if (request.result !== undefined && request.request !== null) {
        var randomNumber = randomIntFromInterval(0, 4);
        captchaQuestions.push(...request.result.splice(randomNumber, 1));

        randomNumber = randomIntFromInterval(0, 3);
        captchaQuestions.push(...request.result.splice(randomNumber, 1));

        randomNumber = randomIntFromInterval(0, 2);
        captchaQuestions.push(...request.result.splice(randomNumber, 1));

        var questionDiv = document.getElementById("question");
        questionDiv.innerHTML = captchaQuestions[0].question;

        document.getElementById("iteration").innerHTML = currentQuestion + 1;
      }
    };
  };

  function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
