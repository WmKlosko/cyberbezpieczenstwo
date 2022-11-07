function login() {
    console.log('logowanie')

    const username = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    const authenticated = true;

    if (authenticated === true) {
        window.location.href = './home.html';
    }
}