import module from "./firebase.mjs"
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {ref, uploadBytes, getDownloadURL, listAll} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import {
    collection, doc, getDoc, getDocs, increment, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js"

// Initialize Firebase
const auth = module.auth;
const storage = module.storage;
const db = module.db;
const usersRef = collection(db, "users");

function createUser(auth, email, password, username) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Get the newly created user
            const user = userCredential.user;

            const userDocRef = doc(usersRef, user.uid);
            setDoc(userDocRef, {
                uid: user.uid,
                username: username,
                wins: 0,
                games: 0
            });

            return userCredential;
        })
        .catch((error) => {
            // Handle the error if creating the user account fails
            throw error;
        });
}


function authenticate(auth, emailValue, passValue, formName, username) {
    if (formName === "signup") {
        return createUser(auth, emailValue, passValue, username);
    } else if (formName === "signin") {
        return signInWithEmailAndPassword(auth, emailValue, passValue);
    }
}

const authForm = document.getElementById('authForm');
authForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent default form submission

    const formName = authForm.getAttribute("name");
    const email = document.getElementById('email');
    const pass = document.getElementById('pass');
    let username = document.getElementById('username'); username = username === null ? "" : username;
    const passRepeat = document.getElementById('pass--rep');
    const avatar = document.getElementById('avatar');

    // Pass Check
    if (formName === "signup") {
        if (pass.value !== passRepeat.value) {
            alert("Passwords don't match");
            pass.value = "";
            passRepeat.value = "";
            return;
        }
    }

    authenticate(auth, email.value, pass.value, formName, username.value)
        .then((userCredential) => {
            const user = userCredential.user;

            let date, expires;
            date = new Date();
            date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();

            document.cookie = "user-id" + "=" + (user.uid || "") + expires + "; path=/";
            document.cookie = "username" + "=" + (user.displayName || "") + expires + "; path=/";

            if (formName === "signup") {
                console.log('User account created: ', user.uid);
                if (avatar.files[0] !== undefined) {
                    // Upload avatar value to cloudstore
                    const avatarFile = avatar.files[0];
                    const avatarRef = ref(storage,'avatars/' + user.uid + '/' + avatarFile.name);

                    uploadBytes(avatarRef, avatarFile).then(() => {
                        console.log('File uploaded successfully!');

                        // Get the download URL of the file
                        getDownloadURL(avatarRef).then((url) => {
                            document.cookie = "avatar" + "=" + (url || "") + expires + "; path=/";

                            // Redirect to home page
                            window.location.href = `index.html`;
                        }).catch((error) => {
                            console.error('Error getting download URL:', error);
                        });
                    }).catch((error) => {
                        console.error('Error uploading file:', error);
                    });
                } else {
                    // Redirect to home page
                    window.location.href = `index.html`;
                }
            } else {
                console.log('User logged-in: ', user.uid);
                // Get avatar link from cloudstore
                const avatarRef = ref(storage,'avatars/' + user.uid);
                listAll(avatarRef)
                    .then((res) => {
                        // Get the first file in the list
                        const fileRef = res.items[0];

                        // Get the download URL of the file
                        getDownloadURL(fileRef)
                            .then((url) => {
                                // Use the download URL to display the image
                                document.cookie = "avatar" + "=" + (url || "") + expires + "; path=/";

                                // Redirect to home page
                                window.location.href = `index.html`;
                            })
                            .catch((error) => {
                                console.error("Error getting download URL:", error);
                            });
                    })
                    .catch((error) => {
                        // Redirect to home page
                        window.location.href = `index.html`;
                    });
            }
        })
        .catch((error) => {
            if (formName === "signup") {
                console.error('Error creating user account: ', error);
                alert('Error creating user account: ' + error);
            } else {
                alert("Invalid credentials")
            }
        });
});
