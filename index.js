function login() {
    console.log('logowanie')

    const username = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    validateUser(username, password);

    const authenticated = true;

    if (authenticated === true) {
        window.location.href = './home.html';
    }
}

function validateUser(username, password)
{
    var request = new XMLHttpRequest();
    request.open("GET", "./fakeapi/users.json", false);
    request.overrideMimeType("application/json");
    request.send(null);
    var usersJson = JSON.parse(request.responseText);
    console.log(usersJson);

    // $.getJSON("./fakeapi/users.json", function(json) {
    //     console.log(json);
    // })
}