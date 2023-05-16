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
let d1;
let d2;
let posData = {
    p1: 1,
    p2: 1,
    p3: 1,
    p4: 1
}

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

function tryMakeAction(events) {
    const e = events[0];
    const dat = e.val();
    if (dat.actor === pnum) {
        MakeAction(e);
    }
}

function MakeAction(action) {
    if (action.type === "RollAndMove") {
        document.getElementById("actionBlock").classList.toggle("hidden");
        document.getElementById("rollDiceButton").classList.toggle("hidden");
    }
}

const RollDiceButton = document.getElementById('rollDiceButton');
RollDiceButton.addEventListener("click", () => {
    MakeDiceRoll();
    moveAndReact(d1+d2);
});

function MakeDiceRoll() {
    document.getElementById("actionBlock").classList.toggle("hidden");
    document.getElementById("rollDiceButton").classList.toggle("hidden");

    // Generate random integers between 1 and 6
    d1 = Math.floor(Math.random() * 6) + 1;
    d2 = Math.floor(Math.random() * 6) + 1;

    AddMessage(`rolls ${d1}:${d2}`);
}

onValue(ref(rdb, 'gameEvents/' + gid), (snapshot) => {

    const events = [];
    snapshot.forEach((childSnapshot) => {
        events.push(childSnapshot);
    });

    events.sort((a, b) => {
        const lobbyDataA = a.key;
        const lobbyDataB = b.key;

        return a.key - b.key;
    });

    tryMakeAction(events);
});

function moveViewCount(start, count) {
    moveViewTo(start, (start + count - 1) % 40 + 1, pnum);
}

function moveViewTo(fromCell, toCell, player) {
    const fromCellElement = document.getElementById(`cell-${fromCell}`);
    const toCellElement = document.getElementById(`cell-${toCell}`);

    const p2CircleElement = fromCellElement.querySelector(`.p${player}-circle`);
    if (p2CircleElement) {
        // Remove p2-circle from the current cell
        p2CircleElement.remove();

        // Add p2-circle to the target cell
        const circleContainer = toCellElement.querySelector('.circle-container');
        if (circleContainer) {
            circleContainer.appendChild(p2CircleElement);
        }
    }
}

function moveAndReact(count) {
    const posRef = ref(rdb, 'positions/' + gid);
    get(posRef)
        .then((snapshot) => {
            const currentData = snapshot.val();

            // Create a new object by copying the current data
            const updateData = { ...currentData };
            const newPos = (posData['p'+pnum] + count - 1) % 40;
            if (posData['p'+pnum] + count - 1 >= 40) { giveMoney(2000, pnum) }
            updateData['p'+ pnum] = newPos;

            set(posRef, updateData);

            reactToCell(newPos);
        })
}

function reactToCell(cellPosition) {
    if (cellPosition in [2, 4, 6, 7, 9, 10,
                         12, 13, 14, 15, 16, 17, 19, 20,
                         22, 24, 25, 26, 27, 28, 29, 30,
                         32, 33, 35, 36, 38, 40]
    ) {
        // property
    }
    else if (cellPosition in [3, 8, 18, 23, 39, 34]
    ) {
        // chance
    }
    else if (cellPosition in [5, 37]
    ) {
        // taxes
    }
    else if (cellPosition in [31]
    ) {
        // go to jail
    }
    else {
        // do nothing
    }
}

function giveMoney(amount, player) {

}

function takeMoney(amount, player) {

}

onValue(ref(rdb, 'positions/' + gid), (snapshot) => {
    const newPosData = snapshot.val();
    moveViewTo(posData.p1, newPosData.p1, 1);
    moveViewTo(posData.p2, newPosData.p2, 2);
    moveViewTo(posData.p3, newPosData.p3, 3);
    moveViewTo(posData.p4, newPosData.p4, 4);
    posData = newPosData;
});

onValue(ref(rdb, 'cells/' + gid), (snapshot) => {
    snapshot.forEach((cell) => {
        const cellData = cell.val();
        const hcell = document.getElementById("cell-"+cell.key).querySelector(".cell");

        hcell.classList.remove("p1");
        hcell.classList.remove("p2");
        hcell.classList.remove("p3");
        hcell.classList.remove("p4");
        if (cellData.owner > 0) {
            hcell.classList.add("p"+cellData.owner);
        }

        document.getElementById("cell-"+cell.key).querySelector(".price-text").innerHTML = cellData.price;
    });
});
