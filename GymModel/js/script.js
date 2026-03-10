// LOGIN SYSTEM

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;

        if (username === "admin" && password === "1234") {

            window.location.href = "admin/dashboard.html";

        }

        else {

            alert("Invalid Login");

        }

    });

}


// MEMBER SYSTEM

const memberForm = document.getElementById("memberForm");

if (memberForm) {

    let members = JSON.parse(localStorage.getItem("members")) || [];
    let plans = JSON.parse(localStorage.getItem("plans")) || [];

    let editIndex = -1;

    const tableBody = document.querySelector("#membersTable tbody");

    function renderMembers() {

        tableBody.innerHTML = "";

        members.forEach((member, index) => {

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${member.name}</td>
<td>${member.phone}</td>
<td>${member.plan}</td>
<td>${member.startDate}</td>
<td>${member.endDate}</td>

<td class="actions">
<button class="edit-btn" onclick="editMember(${index})">✏️</button>
<button class="delete-btn" onclick="deleteMember(${index})">🗑️</button>
</td>
`;

            tableBody.appendChild(row);

        });

    }

    memberForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let name = document.getElementById("name").value;
        let phone = document.getElementById("phone").value;
        let plan = document.getElementById("planSelect").value;

        let today = new Date();

        let planData = plans.find(p => p.name === plan);

        let duration = planData ? parseInt(planData.duration) : 0;

        let endDateObj = new Date();
        endDateObj.setDate(today.getDate() + duration);

        let startDate = today.toLocaleDateString();
        let endDate = endDateObj.toLocaleDateString();

        if (editIndex === -1) {

            members.push({
                name,
                phone,
                plan,
                startDate,
                endDate
            });

        } else {

            members[editIndex] = {
                name,
                phone,
                plan,
                startDate,
                endDate
            };

            editIndex = -1;

        }

        localStorage.setItem("members", JSON.stringify(members));

        renderMembers();

        memberForm.reset();

    });

    window.deleteMember = function (index) {

        members.splice(index, 1);

        localStorage.setItem("members", JSON.stringify(members));

        renderMembers();

    }

    window.editMember = function (index) {

        let member = members[index];

        document.getElementById("name").value = member.name;
        document.getElementById("phone").value = member.phone;
        document.getElementById("planSelect").value = member.plan;

        editIndex = index;

    }

    renderMembers();

}


// LOAD PLANS IN MEMBER DROPDOWN

const planSelect = document.getElementById("planSelect");

if (planSelect) {

    let plans = JSON.parse(localStorage.getItem("plans")) || [];

    plans.forEach(plan => {

        let option = document.createElement("option");

        option.value = plan.name;

        option.textContent = plan.name + " (" + plan.duration + " days)";

        planSelect.appendChild(option);

    });

}
//ATTENDANCE
const memberSelect = document.getElementById("memberSelect");

if (memberSelect) {

    let members = JSON.parse(localStorage.getItem("members")) || [];

    members.forEach(member => {

        let option = document.createElement("option");

        option.value = member.name;

        option.textContent = member.name;

        memberSelect.appendChild(option);

    });

}

function markAttendance() {

    let memberName = document.getElementById("memberSelect").value;
    let status = document.getElementById("statusSelect").value;

    if (memberName === "") {
        alert("Select a member");
        return;
    }

    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

    let today = new Date().toLocaleDateString();

    let alreadyMarked = attendance.find(record =>
        record.name === memberName && record.date === today
    );

    if (alreadyMarked) {
        alert("Attendance already marked today");
        return;
    }

    let now = new Date();

    attendance.push({
        name: memberName,
        status: status,
        date: today,
        time: now.toLocaleTimeString()
    });

    localStorage.setItem("attendance", JSON.stringify(attendance));

    renderAttendance();

}

function renderAttendance() {

    let tableBody = document.querySelector("#attendanceTable tbody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

    attendance.forEach(record => {

        let row = document.createElement("tr");

        row.innerHTML = `
<td>${record.name}</td>
<td>${record.status}</td>
<td>${record.date}</td>
<td>${record.time}</td>
`;

        tableBody.appendChild(row);

    });

}

renderAttendance();
// DASHBOARD MEMBER COUNT

document.addEventListener("DOMContentLoaded", function () {

    const memberCount = document.getElementById("memberCount");

    if (memberCount) {

        let members = JSON.parse(localStorage.getItem("members")) || [];

        memberCount.textContent = members.length;

    }

});
document.addEventListener("DOMContentLoaded", function () {

    let members = JSON.parse(localStorage.getItem("members")) || [];

    let countElement = document.getElementById("memberCount");

    if (countElement) {
        countElement.innerText = members.length;
    }

});
// TODAY'S ATTENDANCE COUNT

const todayAttendance = document.getElementById("todayAttendance");

if (todayAttendance) {

    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

    let today = new Date().toLocaleDateString();

    let todayCount = attendance.filter(record =>
        record.date === today && record.status === "Present"
    ).length;

    todayAttendance.innerText = todayCount;

}
// PLAN SYSTEM

const planForm = document.getElementById("planForm");

if (planForm) {

    let plans = JSON.parse(localStorage.getItem("plans")) || [];

    const tableBody = document.querySelector("#plansTable tbody");

    function renderPlans() {

        tableBody.innerHTML = "";

        plans.forEach(plan => {

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${plan.name}</td>
<td>${plan.price}</td>
<td>${plan.duration} days</td>
`;

            tableBody.appendChild(row);

        });

    }

    planForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let name = document.getElementById("planName").value;
        let price = document.getElementById("planPrice").value;
        let duration = document.getElementById("planDuration").value;

        plans.push({ name, price, duration });

        localStorage.setItem("plans", JSON.stringify(plans));

        renderPlans();

        planForm.reset();

    });

    renderPlans();

}