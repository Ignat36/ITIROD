import module from "./firebase.mjs"
import {collection, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js"
import { ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import {ref as sref, uploadBytes, getDownloadURL, listAll} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

const db = module.db;
const rdb = module.rdb;
const storage = module.storage;
const usersRef = collection(db, "users");
let pnum = 0;
let pid = "";
let gid = 0;

async function getUserRecord(uid) {
    try {
        const userDocRef = doc(usersRef, uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            //console.log("User record does not exist.");
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
    gid = getCookie("game-id");
    pid = getCookie("user-id");
    const lobbyRef = ref(rdb, 'lobbies/' + gid);
    get(lobbyRef)
        .then((snapshot) => {
            const lobbyData = snapshot.val();

            if (lobbyData.p1 === pid) { pnum = "1" }
            else if (lobbyData.p2 === pid) { pnum = "2" }
            else if (lobbyData.p3 === pid) { pnum = "3" }
            else if (lobbyData.p4 === pid) { pnum = "4" }

            tryMakeAction();
        })
});

function tryMakeAction() {
    const lobbyRef = ref(rdb, 'gameEvents/' + gid);
    get(lobbyRef)
        .then((snapshot) => {
            const eventData = snapshot.val();
        })
}

onValue(ref(rdb, 'gameEvents/' + gid), (snapshot) => {
   tryMakeAction();
});