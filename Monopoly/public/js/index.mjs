import module from "./firebase.mjs"

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

window.addEventListener('load', function () {

    // Show elements based on the value
    if (getCookie("user-id")) {
        document.getElementById('current-game').classList.toggle('hidden');

        // Change profile data [API functionality]
        if (getCookie("avatar")) {
            document.getElementById("avatar").setAttribute("src", getCookie("avatar"))
        }
        if (getCookie("username")) {
            document.getElementById("username").innerHTML = getCookie("username");
        }
    }
});

let signOutLink = document.getElementById("sign-out-link");
signOutLink.addEventListener('click', (event) => {

    document.cookie = "user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "avatar=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    location.reload();
});