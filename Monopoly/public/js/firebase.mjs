import {initializeApp} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {getStorage} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import {getDatabase} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA3t6An4OxSweKbBzEmcTOWuIhiMFp81iw",
    authDomain: "monopoly-d6d49.firebaseapp.com",
    databaseURL: "https://monopoly-d6d49-default-rtdb.firebaseio.com",
    projectId: "monopoly-d6d49",
    storageBucket: "monopoly-d6d49.appspot.com",
    messagingSenderId: "622883209886",
    appId: "1:622883209886:web:e3422547904cf932e7318f",
    measurementId: "G-J3ZCKJP272"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rdb = getDatabase(app);

export default {
    app,
    storage,
    auth,
    db,
    rdb,
};