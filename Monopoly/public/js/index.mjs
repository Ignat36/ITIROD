import module from "./firebase.mjs"
import {collection, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js"

const db = module.db;
const usersRef = collection(db, "users");

async function getUserRecord(uid) {
    try {
        const userDocRef = doc(usersRef, uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.log("User record does not exist.");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving user record:", error);
        return null;
    }
}

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

        document.getElementById('sign-up-link').classList.add('hidden');
        document.getElementById('sign-up-link').classList.toggle('ref-text');
        document.getElementById('sign-in-link').innerHTML = "Sign Out";
        // Change profile data [API functionality]
        if (getCookie("avatar")) {
            document.getElementById("avatar").setAttribute("src", getCookie("avatar"))
        }
        if (getCookie("username")) {
            document.getElementById("username").innerHTML = getCookie("username");
        }

        getUserRecord(getCookie("user-id")).then((record) => {
            console.error(record);
            document.getElementById('wins-count').innerHTML = record.wins;
            document.getElementById('games-count').innerHTML = record.games;
            document.getElementById('win-rate').innerHTML = (record.wins / (record.games > 0 ? record.games : 1) * 100).toFixed(2) + "%";
        })
    }
});

let signOutLink = document.getElementById("sign-in-link");
signOutLink.addEventListener('click', (event) => {

    document.cookie = "user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "avatar=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    location.reload();
});