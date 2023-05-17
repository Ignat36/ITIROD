import module from "./firebase.mjs"
import {collection, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js"
import { ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import {ref as sref, uploadBytes, getDownloadURL, listAll} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

const db = module.db;
const rdb = module.rdb;
const storage = module.storage;
const usersRef = collection(db, "users");
let pcount = 0;
let pnum = 0;
let gid = getCookie("game-id");
let pid = getCookie("user-id");
let d1;
let d2;
let posData = {
    p1: 1,
    p2: 1,
    p3: 1,
    p4: 1
}
let moneyData = {
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0
}
let currentEvent;
let messages;
let username;
getUserRecord(pid)
    .then( (record) => {
        username = record.username;
    })

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

});

function tryMakeAction(events) {
    if (events.length > 0) {
        const e = events[0];
        currentEvent = e;
        const dat = e.val();
        if (dat.actor === pnum) {
            MakeAction(dat);
        }
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

function AddMessage(msg) {
    const id = messages.length > 0 ?  Number(messages[0].key) + 1 : 1;
    const msgRef = ref(rdb, 'messages/' + gid + `/${id}`);
    set(msgRef, {
        message: msg,
        ownerNum: pnum,
        ownerName: username
    });
}

function moveViewCount(start, count) {
    moveViewTo(start, (start + count - 1) % 40 + 1, pnum);
}

function moveViewTo(fromCell, toCell, player) {
    if (fromCell === toCell) { return; }
    const oneMoreElement = (fromCell % 40) + 1;
    const toCellElement = document.getElementById(`cell-${oneMoreElement}`);

    const pCircleElements = document.querySelectorAll(`.p${player}-circle`);
    pCircleElements.forEach( (pCircleElement) => {
        pCircleElement.remove();
    });

    const circleContainer = toCellElement.querySelector('.circle-container');
    if (circleContainer) {
        const pDiv = document.createElement("div");
        pDiv.classList.add("circle");
        pDiv.classList.add(`p${player}-circle`);
        circleContainer.appendChild(pDiv);
    }

    setTimeout(function () { moveViewTo(oneMoreElement, toCell, player)}, 300);
}

function moveAndReact(count, loopPrice = true) {
    const posRef = ref(rdb, 'positions/' + gid);
    get(posRef)
        .then((snapshot) => {
            const currentData = snapshot.val();

            // Create a new object by copying the current data
            const updateData = { ...currentData };
            const newPos = (Number(posData['p'+pnum]) + Number(count) - 1) % 40 + 1;
            if (posData['p'+pnum] + count - 1 >= 40 && loopPrice) { giveMoney(2000, pnum) }
            updateData['p'+ pnum] = newPos;
            console.log(newPos, updateData);

            set(posRef, updateData);

            reactToCell(newPos);
        });
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
        //ReactToChance();
    }
    else if (cellPosition in [5, 37]
    ) {
        if (cellPosition === 5) takeMoney(2000, pnum);
        if (cellPosition === 37) takeMoney(1000, pnum);
    }
    else if (cellPosition in [31]
    ) {
        //GoToJail();
    }
    else {
        // do nothing
    }
    const eventsRef = ref(rdb, 'gameEvents/' + gid);
    get(eventsRef)
        .then((snapshot) => {

            let maxId = 0;
            snapshot.forEach((childSnapshot) => {
                maxId = maxId < childSnapshot.key ? childSnapshot.key : maxId;
            });
            remove(ref(rdb, 'gameEvents/' + gid + `/${currentEvent.key}`));
            set(ref(rdb, 'gameEvents/' + gid + `/${Number(maxId)+1}`), {
                actor: (currentEvent.val().actor % pcount) + 1,
                type: "RollAndMove"
            });
        })
}

function giveMoney(amount, player) {
    const moneyRef = ref(rdb, 'money/' + gid);
    get(moneyRef)
        .then((snapshot) => {
            const currentData = snapshot.val();

            // Create a new object by copying the current data
            const updateData = { ...currentData };
            updateData['p'+ player] += amount;

            set(moneyRef, updateData);
        });
}

function takeMoney(amount, player) {
    const moneyRef = ref(rdb, 'money/' + gid);
    get(moneyRef)
        .then((snapshot) => {
            const currentData = snapshot.val();

            // Create a new object by copying the current data
            const updateData = { ...currentData };
            if (updateData['p'+ player] < amount) {
                // react to player bankrupt
            }
            updateData['p'+ player] -= amount;

            set(moneyRef, updateData);
        });
}

onValue(ref(rdb, 'positions/' + gid), (snapshot) => {
    const newPosData = snapshot.val();

    if (pnum < 1) {
        posData = newPosData;
    }
    moveViewTo(posData.p1, newPosData.p1, 1);
    moveViewTo(posData.p2, newPosData.p2, 2);
    if (pcount > 2) moveViewTo(posData.p3, newPosData.p3, 3);
    if (pcount > 3) moveViewTo(posData.p4, newPosData.p4, 4);
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

        document.getElementById("cell-"+cell.key).querySelector(".price-text").innerHTML = "$" + cellData.price + "k";
    });
});

onValue(ref(rdb, 'money/' + gid), (snapshot) => {
    moneyData = snapshot.val();
    document.getElementById("player-1").querySelector(".side-player-money__text").innerHTML = "$" + moneyData.p1;
    document.getElementById("player-2").querySelector(".side-player-money__text").innerHTML = "$" + moneyData.p2;
    if (pcount > 2) document.getElementById("player-3").querySelector(".side-player-money__text").innerHTML = "$" + moneyData.p3;
    if (pcount > 3) document.getElementById("player-4").querySelector(".side-player-money__text").innerHTML = "$" + moneyData.p4;
});


onValue(ref(rdb, 'messages/' + gid), (snapshot) => {

    messages = [];
    snapshot.forEach((childSnapshot) => {
        messages.push(childSnapshot);
    });

    messages.sort((a, b) => {
        return b.key - a.key;
    });

    const logMsgUl = document.getElementById('log-msg');
    logMsgUl.innerHTML = "";

    messages.forEach((message) => {
        const li = document.createElement('li');
        li.className = 'message';
        li.id = 'msg-' + message.key;

        const p1Name = document.createElement('strong');
        p1Name.className = `p${message.val().ownerNum}-name`;
        p1Name.textContent = message.val().ownerName;

        const gameMsg = document.createElement('strong');
        gameMsg.className = 'game-msg';
        gameMsg.textContent = message.val().message;

        li.appendChild(p1Name);
        li.appendChild(gameMsg);

        logMsgUl.appendChild(li);
    });

});

onValue(ref(rdb, 'gameEvents/' + gid), (snapshot) => {
    if (pnum === 0) {
        pnum = -1;
        const lobbyRef = ref(rdb, 'lobbies/' + gid);
        get(lobbyRef)
            .then((lobbiesSnapshot) => {
                const lobbyData = lobbiesSnapshot.val();
                pcount = lobbyData.count;
                if (lobbyData.p1 === pid) { pnum = 1 }
                else if (lobbyData.p2 === pid) { pnum = 2 }
                else if (lobbyData.p3 === pid) { pnum = 3 }
                else if (lobbyData.p4 === pid) { pnum = 4 }

                // Get the reference to the parent ul element
                const ulElement = document.querySelector('.side-players__ul');
                ulElement.innerHTML = "";

                for (let i = 1; i <= lobbyData.count; i++) {

                    const pcirc = document.createElement("div");
                    pcirc.classList.add("circle");
                    pcirc.classList.add(`p${i}-circle`);
                    document.getElementById("cell-" + posData["p"+i]).querySelector(".circle-container")
                        .appendChild(pcirc);

                    // Create a list item element
                    const liElement = document.createElement('li');
                    liElement.setAttribute('id', 'player-' + i);
                    liElement.classList.add('side-players__li');

                    // Create the inner elements for the player view
                    const playerView = document.createElement('div');
                    playerView.classList.add('side-player-view');

                    const circleImgShape = document.createElement('div');
                    circleImgShape.classList.add('circle-img-shape');

                    const playerName = document.createElement('strong');
                    playerName.classList.add('side-player-name__text');

                    const profileImg = document.createElement('img');
                    profileImg.setAttribute('alt', 'Profile picture');

                    const pavatarRef = sref(storage,'avatars/' + lobbyData["p"+i]);
                    listAll(pavatarRef)
                        .then((ares) => {
                            // Get the first file in the list
                            const fileRef = ares.items[0];

                            // Get the download URL of the file
                            getDownloadURL(fileRef)
                                .then((url) => {
                                    profileImg.setAttribute('src', url);
                                })
                                .catch((error) => {
                                    profileImg.setAttribute('src', "img/chance.png");
                                });
                        })
                        .catch((error) => {
                            profileImg.setAttribute('src', "img/chance.png");
                        });

                    getUserRecord(lobbyData["p"+i]).then( (record) => {
                        playerName.textContent = record.username;
                    });

                    const playerMoney = document.createElement('strong');
                    playerMoney.classList.add('side-player-money__text');
                    playerMoney.textContent = '$12,000k';

                    // Assemble the elements
                    circleImgShape.appendChild(profileImg);
                    playerView.appendChild(circleImgShape);
                    playerView.appendChild(playerName);
                    playerView.appendChild(playerMoney);
                    liElement.appendChild(playerView);

                    // Append the li element to the ul element
                    ulElement.appendChild(liElement);
                }

                const events = [];
                snapshot.forEach((childSnapshot) => {
                    events.push(childSnapshot);
                });

                events.sort((a, b) => {

                    return a.key - b.key;
                });

                tryMakeAction(events);
            })
        return;
    }

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
