import module from "./firebase.mjs"
import {collection, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js"
import { ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import {ref as sref, uploadBytes, getDownloadURL, listAll} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

const db = module.db;
const rdb = module.rdb;
const storage = module.storage;
const usersRef = collection(db, "users");

function generateRandomCode() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }

    return code;
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

    // Show elements based on the value
    if (getCookie("user-id")) {

        document.getElementById('sign-up-link').classList.add('hidden');
        document.getElementById('sign-up-link').classList.toggle('ref-text');
        document.getElementById('sign-in-link').innerHTML = "Sign Out";
        // Change profile data [API functionality]
        if (getCookie("avatar")) {
            document.getElementById("avatar").setAttribute("src", getCookie("avatar"))
        }

        if (getCookie("game-id")) {
            loadCurrentGame();
        }

        getUserRecord(getCookie("user-id")).then((record) => {
            document.getElementById('wins-count').innerHTML = record.wins;
            document.getElementById('games-count').innerHTML = record.games;
            document.getElementById('win-rate').innerHTML = (record.wins / (record.games > 0 ? record.games : 1) * 100).toFixed(2) + "%";
            document.getElementById("username").innerHTML = record.username;
        });
    }
});

let signOutLink = document.getElementById("sign-in-link");
signOutLink.addEventListener('click', (event) => {

    document.cookie = "user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "game-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "avatar=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    location.reload();
});

function loadCurrentGame() {

    const gid = getCookie("game-id");
    if (gid === null) return;

    console.log(gid);
    const lobbyRef = ref(rdb, 'lobbies/' + gid);
    get(lobbyRef)
        .then((snapshot) => {
            const lobbyData = snapshot.val();

            document.getElementById('current-game').classList.remove('hidden');

            const ulElement = document.createElement('ul');
            ulElement.classList.add('current-game__ul');

            // Create the <div> element with class "profile__section-view-code"
            const profileSectionViewCode = document.createElement('div');
            profileSectionViewCode.className = 'profile__section-view-code';

            // Create the <strong> element with class "available-game__text" and "code"
            const codeStrong = document.createElement('strong');
            codeStrong.className = 'var-text';
            codeStrong.innerHTML = '<b>Code:</b><br>';

            // Create the <strong> element with class "available-game__text" and "code-value"
            const codeValueStrong = document.createElement('strong');
            codeValueStrong.className = 'var-text';
            codeValueStrong.innerHTML = `<b>${lobbyData.code}</b>`;

            // Append the code elements to the profileSectionViewCode
            profileSectionViewCode.appendChild(codeStrong);
            profileSectionViewCode.appendChild(codeValueStrong);

            let flag = 0;
            for (let i = 0; i < lobbyData.count; i++) {
                let pid = "";
                switch (i) {
                    case 0:
                        pid = lobbyData.p1;
                        if (pid !== "") flag++;
                        break;
                    case 1:
                        pid = lobbyData.p2;
                        if (pid !== "") flag++;
                        break;
                    case 2:
                        pid = lobbyData.p3;
                        if (pid !== "") flag++;
                        break;
                    case 3:
                        pid = lobbyData.p4;
                        if (pid !== "") flag++;
                        break;
                    default:
                        console.error("too much");
                        return;
                }

                const liElement = document.createElement('li');
                liElement.classList.add('current-game__li');

                const divElement = document.createElement('div');
                divElement.classList.add('profile__section-view');

                const circleImgShape = document.createElement('div');
                circleImgShape.classList.add('circle-img-shape');

                const imgElement = document.createElement('img');
                if (pid === "") {
                    imgElement.src = 'img/connect.png';
                    imgElement.alt = 'Profile picture';
                }
                else {
                    const pavatarRef = sref(storage,'avatars/' + pid);
                    listAll(pavatarRef)
                        .then((ares) => {
                            // Get the first file in the list
                            const fileRef = ares.items[0];

                            // Get the download URL of the file
                            getDownloadURL(fileRef)
                                .then((url) => {
                                    imgElement.src = url;
                                    imgElement.alt = 'Profile picture';
                                })
                                .catch((error) => {
                                    imgElement.src = 'img/chance.png';
                                    imgElement.alt = 'Profile picture';
                                });
                        })
                        .catch((error) => {
                            imgElement.src = 'img/chance.png';
                            imgElement.alt = 'Profile picture';
                        });
                }

                const strongElement = document.createElement('strong');
                strongElement.classList.add('var-text');

                if (pid !== "") {
                    getUserRecord(pid).then( (record) => {
                        strongElement.textContent = record.username;
                    });
                }

                circleImgShape.appendChild(imgElement);
                divElement.appendChild(circleImgShape);
                divElement.appendChild(strongElement);
                liElement.appendChild(divElement);
                ulElement.appendChild(liElement);
            }

            document.getElementById('current-game-list').innerHTML = "";
            document.getElementById('current-game-list').appendChild(profileSectionViewCode);
            document.getElementById('current-game-list').appendChild(ulElement);

            console.log(flag, lobbyData.count);
            if (flag == lobbyData.count) {
                window.location.href = "game.html";
            }
        })
        .catch((error) => {
            console.error("Error loading current game:", error);
        });
}

const createGameForm = document.getElementById('createGameForm');
createGameForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent default form submission

    if (getCookie("user-id") == null) {
        alert("You have to authorize to create lobby!");
        return;
    }

    if (getCookie("game-id")) {
        alert("You're already connected to game!");
        return;
    }


    const form = e.target;
    const playersCount = form.elements.players.value;
    const isPrivate = form.elements.private.checked;
    const code = generateRandomCode();

    let date, expires;
    date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();

    set(ref(rdb, 'lobbies/' + code), {
        code: code,
        date: date.getTime(),
        count: playersCount,
        visible: !isPrivate,
        p1: getCookie("user-id"),
        p2: "",
        p3: "",
        p4: "",
    })
        .then(() => {
            //console.log("Created new game ", code);
        })
        .catch((error) => {
            console.error("Error creating new game", error);
        });

    document.cookie = "game-id" + "=" + (code || "") + expires + "; path=/";
    loadCurrentGame();
});

const connectGameForm = document.getElementById('connectGameForm');
connectGameForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent default form submission

    if (getCookie("user-id") == null) {
        alert("You have to authorize to create lobby!");
        return;
    }

    if (getCookie("game-id")) {
        alert("You're already connected to game!");
        return;
    }

    const inputField = document.getElementById('connection-code__input');
    const code = inputField.value;
    const uid = getCookie("user-id");

    let date, expires;
    date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();

    const lobbyRef = ref(rdb, 'lobbies/' + code);
    get(lobbyRef)
        .then((snapshot) => {
            const currentData = snapshot.val();

            if (currentData === null) {
                alert(`Game ${code} does not exists:(`);
                return;
            }

            // Create a new object by copying the current data
            const updateData = { ...currentData };

            if (updateData["p1"] === "") {updateData["p1"] = uid;}
            else if (updateData["p2"] === "") {updateData["p2"] = uid;}
            else if (updateData["p3"] === "") {updateData["p3"] = uid;}
            else if (updateData["p4"] === "") {updateData["p4"] = uid;}

            // Update the lobby record in the Realtime Database
            set(lobbyRef, updateData).then(() => {
                document.cookie = "game-id" + "=" + (code || "") + expires + "; path=/";
                loadCurrentGame();
            })

        })
        .catch((error) => {
            console.error("Error connecting", error);
            return;
        });
});

function createGameListItem(lobbyData) {
    // Create the <li> element
    const li = document.createElement('li');
    li.className = 'games-list__li';

    // Create the <div> element with class "available-game__wrapper"
    const availableGameWrapper = document.createElement('div');
    availableGameWrapper.className = 'available-game__wrapper';

    // Create the <div> element with class "profile__section-view-code"
    const profileSectionViewCode = document.createElement('div');
    profileSectionViewCode.className = 'profile__section-view-code';

    // Create the <strong> element with class "available-game__text" and "code"
    const codeStrong = document.createElement('strong');
    codeStrong.className = 'available-game__text';
    codeStrong.innerHTML = '<b>Code:</b><br>';

    // Create the <strong> element with class "available-game__text" and "code-value"
    const codeValueStrong = document.createElement('strong');
    codeValueStrong.className = 'available-game__text';
    codeValueStrong.innerHTML = `<b>${lobbyData.code}</b>`;

    // Append the code elements to the profileSectionViewCode
    profileSectionViewCode.appendChild(codeStrong);
    profileSectionViewCode.appendChild(codeValueStrong);

    // Create the <ul> element with class "available-game__ul"
    const availableGameUl = document.createElement('ul');
    availableGameUl.className = 'available-game__ul';

    // Create the three <li> elements inside the <ul>
    for (let i = 0; i < lobbyData.count; i++) {
        let pid = "";
        switch (i) {
            case 0:
                pid = lobbyData.p1;
                break;
            case 1:
                pid = lobbyData.p2;
                break;
            case 2:
                pid = lobbyData.p3;
                break;
            case 3:
                pid = lobbyData.p4;
                break;
            default:
                console.error("too much");
                return;
        }
        const availableGameLi = document.createElement('li');
        availableGameLi.className = 'available-game__li';

        const label = document.createElement('label');

        const hiddenInput = document.createElement('input');
        hiddenInput.className = 'hidden';
        hiddenInput.type = 'radio';
        hiddenInput.name = 'game-option';
        hiddenInput.value = `${i+1}${lobbyData.code}`;
        hiddenInput.onchange = handleRadioChange;

        const profileSectionView = document.createElement('div');
        profileSectionView.className = 'profile__section-view';

        const circleImgShape = document.createElement('div');
        circleImgShape.className = 'circle-img-shape';

        const img = document.createElement('img');
        if (pid === "") {
            img.src = 'img/connect.png';
            img.alt = 'Profile picture';
        }
        else {
            const pavatarRef = sref(storage,'avatars/' + pid);
            listAll(pavatarRef)
                .then((ares) => {
                    // Get the first file in the list
                    const fileRef = ares.items[0];

                    // Get the download URL of the file
                    getDownloadURL(fileRef)
                        .then((url) => {
                            img.src = url;
                            img.alt = 'Profile picture';
                        })
                        .catch((error) => {
                            img.src = 'img/chance.png';
                            img.alt = 'Profile picture';
                        });
                })
                .catch((error) => {
                    img.src = 'img/chance.png';
                    img.alt = 'Profile picture';
                });
        }


        const textStrong = document.createElement('strong');
        textStrong.className = 'available-game__text';

        profileSectionView.appendChild(circleImgShape);
        circleImgShape.appendChild(img);
        profileSectionView.appendChild(textStrong);

        if (pid === "") {
            label.appendChild(hiddenInput);
            label.appendChild(profileSectionView);
            availableGameLi.appendChild(label);
        }
        else {
            getUserRecord(pid).then( (record) => {
                textStrong.textContent = record.username;
            });
            availableGameLi.appendChild(profileSectionView);
        }

        availableGameUl.appendChild(availableGameLi);
    }

    // Append the elements to the <div> with class "available-game__wrapper"
    availableGameWrapper.appendChild(profileSectionViewCode);
    availableGameWrapper.appendChild(availableGameUl);

    // Append the <div> with class "available-game__wrapper" to the <li>
    li.appendChild(availableGameWrapper);

    return li;
}

function leaveCurrentGame() {
    const gid = getCookie("game-id");
    const uid = getCookie("user-id");
    if (gid === null) return;

    const lobbyRef = ref(rdb, 'lobbies/' + gid);
    get(lobbyRef)
        .then((snapshot) => {
            const currentData = snapshot.val();
            const updateData = { ...currentData };
            document.cookie = "game-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            if (updateData["p1"] === uid) {updateData["p1"] = "";}
            if (updateData["p2"] === uid) {updateData["p2"] = "";}
            if (updateData["p3"] === uid) {updateData["p3"] = "";}
            if (updateData["p4"] === uid) {updateData["p4"] = "";}

            if (updateData["p1"] === "" &&
                updateData["p2"] === "" &&
                updateData["p3"] === "" &&
                updateData["p4"] === "") {

                return remove(lobbyRef);
            }
            else {
                return set(lobbyRef, updateData);
            }
        })
        .then(() => {
            //console.log("Left game:", gid);

        })
        .catch((error) => {
            console.error("Error updating game record:", error);
        });

}

function handleRadioChange(event) {

    if (getCookie("user-id") == null) {
        alert("You have to authorize to create lobby!");
        return;
    }

    const selectedOption = event.target.value;
    const isChecked = event.target.checked;
    const userId = getCookie("user-id");
    const gid = getCookie("game-id");

    const playerIndex = selectedOption.slice(0, 1);
    const code = selectedOption.slice(1, 5);

    // Retrieve the current lobby data from the Realtime Database
    const lobbyRef = ref(rdb, 'lobbies/' + code);
    get(lobbyRef)
        .then((snapshot) => {
            const currentData = snapshot.val();

            // Create a new object by copying the current data
            const updateData = { ...currentData };

            // Update the desired property based on the checked status and player index
            if (isChecked && playerIndex >= '1' && playerIndex <= '4') {

                if (gid === code) {
                    if (updateData["p1"] === userId) {updateData["p1"] = "";}
                    if (updateData["p2"] === userId) {updateData["p2"] = "";}
                    if (updateData["p3"] === userId) {updateData["p3"] = "";}
                    if (updateData["p4"] === userId) {updateData["p4"] = "";}
                } else {
                    leaveCurrentGame();
                }
                updateData['p' + playerIndex] = userId;

                if (updateData["p1"] !== "" &&
                    updateData["p2"] !== "" &&
                    updateData["p3"] !== "" &&
                    updateData["p4"] !== ""
                ) {
                    updateData["visible"] = false;
                }

                let date, expires;
                date = new Date();
                date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
                expires = "; expires=" + date.toUTCString();
                document.cookie = "game-id" + "=" + (code || "") + expires + "; path=/";
            } else {
                updateData['p' + playerIndex] = '';
            }

            // Update the lobby record in the Realtime Database
            set(lobbyRef, updateData).then(() => {
                loadCurrentGame();
            })

        })
        .then(() => {
            console.log("Updated game record:", code);
        })
        .catch((error) => {
            console.error("Error updating game record:", error);
        });
}

// Listen for updates in the "lobbies" node
onValue(ref(rdb, 'lobbies'), (snapshot) => {
    document.getElementById('lobbies').innerHTML = "";

    // Get an array of child snapshots
    const childSnapshots = [];
    snapshot.forEach((childSnapshot) => {
        childSnapshots.push(childSnapshot);
    });

    // Sort the child snapshots based on the date parameter
    childSnapshots.sort((a, b) => {
        const lobbyDataA = a.val();
        const lobbyDataB = b.val();

        const dateA = lobbyDataA.date; // Replace 'date' with the actual date parameter in your lobbyData
        const dateB = lobbyDataB.date; // Replace 'date' with the actual date parameter in your lobbyData

        // Assuming the date parameter is in string format, you can parse it into Date objects for comparison
        const parsedDateA = new Date(dateA);
        const parsedDateB = new Date(dateB);

        // Compare the parsed dates
        return parsedDateA - parsedDateB;
    });

    loadCurrentGame();

    // Iterate through the sorted child snapshots
    childSnapshots.forEach((childSnapshot) => {
        const lobbyData = childSnapshot.val();
        const code = childSnapshot.key;

        if (lobbyData === null || lobbyData.visible === false) {
            return;
        }

        // Create or update the lobby HTML element
        const lobbyElement = document.getElementById(code);
        if (lobbyElement) {
            lobbyElement.remove();
            if (childSnapshot.exists()) {
                const li = createGameListItem(lobbyData);
                document.getElementById('lobbies').appendChild(li);
            }
        } else {
            // Create new lobby element
            const li = createGameListItem(lobbyData);
            document.getElementById('lobbies').appendChild(li);
        }
    });
});

const leaveButton = document.getElementById('leaveButton');
leaveButton.addEventListener('click', function () {
    document.getElementById('current-game').classList.add('hidden');
    leaveCurrentGame();
});

