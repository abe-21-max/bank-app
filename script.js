// ---------- USERS ----------
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");
let showBalance = false;

// ---------- UI ----------
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const appPage = document.getElementById("appPage");

// ---------- CHECK ----------
if (!loginPage || !registerPage || !appPage) {
    throw new Error("HTML elements not found");
}

// ---------- NAV ----------
function showLogin() {
    loginPage.style.display = "block";
    registerPage.style.display = "none";
    appPage.style.display = "none";
}

function showRegister() {
    loginPage.style.display = "none";
    registerPage.style.display = "block";
    appPage.style.display = "none";
}

function showApp() {
    loginPage.style.display = "none";
    registerPage.style.display = "none";
    appPage.style.display = "block";

    if (currentUser && users[currentUser]) {
        document.getElementById("userDisplay").innerText = currentUser;
        loadData();
    }
}

// ---------- START ----------
if (currentUser && users[currentUser]) {
    showApp();
} else {
    showLogin();
}

// ---------- SAVE ----------
function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
}

// ---------- GET USER ----------
function getUser() {
    return users[currentUser];
}

// ---------- REGISTER ----------
function register() {
    let user = document.getElementById("regUser").value.trim();
    let pass = document.getElementById("regPass").value;
    let pin = document.getElementById("regPin").value;

    if (!user || !pass || !pin) return alert("Fill all fields");
    if (users[user]) return alert("User already exists");

    users[user] = {
        password: pass,
        pin: pin,
        balance: 0,
        history: []
    };

    saveAll();
    alert("Account created!");
    showLogin();
}

// ---------- LOGIN ----------
function login() {
    let user = document.getElementById("loginUser").value.trim();
    let pass = document.getElementById("loginPass").value;

    if (!users[user] || users[user].password !== pass) {
        return alert("Invalid login");
    }

    currentUser = user;
    localStorage.setItem("currentUser", currentUser);

    showApp();
}

// ---------- LOGOUT ----------
function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    showLogin();
}

// ---------- LOAD DATA ----------
function loadData() {
    let user = getUser();
    if (!user) return;

    let balanceElement = document.getElementById("balance");

    // hide balance with stars
    balanceElement.innerText = showBalance ? user.balance : "****";

    let list = document.getElementById("historyList");
    list.innerHTML = "";

    user.history.forEach(item => {
        let li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    });
}

// ---------- TOGGLE BALANCE ----------
function toggleBalance() {
    showBalance = !showBalance;
    loadData();
}

// ---------- DEPOSIT ----------
function deposit() {
    let amount = Number(document.getElementById("amount").value);
    let user = getUser();

    if (!user) return alert("Login first");
    if (amount <= 0 || isNaN(amount)) return alert("Invalid amount");

    user.balance += amount;

    let id = "TX-" + Date.now();
    let time = new Date().toLocaleString();

    user.history.unshift(`${id} | CREDIT +${amount} | ${time}`);

    saveAll();
    loadData();
}

// ---------- WITHDRAW ----------
function withdraw() {
    let amount = Number(document.getElementById("amount").value);
    let user = getUser();

    if (!user) return alert("Login first");
    if (amount <= 0 || isNaN(amount)) return alert("Invalid amount");

    if (user.balance < amount) return alert("Not enough balance");

    user.balance -= amount;

    let id = "TX-" + Date.now();
    let time = new Date().toLocaleString();

    user.history.unshift(`${id} | DEBIT -${amount} | ${time}`);

    saveAll();
    loadData();
}

// ---------- TRANSFER ----------
function transfer() {
    let toUser = document.getElementById("toUser").value.trim();
    let amount = Number(document.getElementById("transferAmount").value);

    let sender = getUser();

    if (!sender) return alert("Login first");
    if (!toUser || amount <= 0 || isNaN(amount)) return alert("Invalid input");
    if (!users[toUser]) return alert("User not found");
    if (toUser === currentUser) return alert("Cannot transfer to yourself");

    let receiver = users[toUser];

    if (sender.balance < amount) return alert("Not enough balance");

    sender.balance -= amount;
    receiver.balance += amount;

    let id = "TX-" + Date.now();
    let time = new Date().toLocaleString();

    sender.history.unshift(`${id} | SENT -${amount} → ${toUser} | ${time}`);
    receiver.history.unshift(`${id} | RECEIVED +${amount} ← ${currentUser} | ${time}`);

    users[currentUser] = sender;
    users[toUser] = receiver;

    saveAll();
    loadData();
}

// ---------- CLEAR ----------
function clearHistory() {
    let user = getUser();
    user.history = [];
    saveAll();
    loadData();
}