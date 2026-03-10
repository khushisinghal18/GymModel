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

            let status = "-";
            let color = "black";

            if (member.endDate) {

                let today = new Date();
                let endDate = new Date(member.endDate);

                let diffTime = endDate - today;
                let daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (daysLeft < 0) {
                    status = "Expired";
                    color = "red";
                }
                else if (daysLeft <= 7) {
                    status = "Expiring Soon";
                    color = "orange";
                }
                else {
                    status = "Active";
                    color = "green";
                }

            }

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${member.name}</td>
<td>${member.phone}</td>
<td>${member.plan}</td>
<td>${member.startDate || "-"}</td>
<td>${member.endDate || "-"}</td>

<td style="color:${color}; font-weight:bold;">
${status}
</td>

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
                id: Date.now(),
                name,
                phone,
                plan,
                startDate,
                endDate
            });

        } else {

            members[editIndex].name = name;
            members[editIndex].phone = phone;
            members[editIndex].plan = plan;

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
// MEMBER SEARCH

const memberSearch = document.getElementById("memberSearch");

if (memberSearch) {

    memberSearch.addEventListener("keyup", function () {

        let value = this.value.toLowerCase();

        let rows = document.querySelectorAll("#membersTable tbody tr");

        rows.forEach(row => {

            let name = row.children[0].innerText.toLowerCase();

            if (name.includes(value)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        });

    });

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
// UNPAID MEMBERS COUNT

const unpaidMembers = document.getElementById("unpaidMembers");

if (unpaidMembers) {

    let members = JSON.parse(localStorage.getItem("members")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];

    let today = new Date();
    let month = today.toLocaleString('default', { month: 'long' });
    let year = today.getFullYear();

    let unpaidCount = 0;

    members.forEach(member => {

        let payment = payments.find(p =>
            p.member === member.name &&
            p.month === month &&
            p.year === year
        );

        if (!payment || payment.status !== "Paid") {
            unpaidCount++;
        }

    });

    unpaidMembers.innerText = unpaidCount;

}
// MONTHLY REVENUE CALCULATION

const revenueElement = document.getElementById("monthlyRevenue");

if (revenueElement) {

    let payments = JSON.parse(localStorage.getItem("payments")) || [];

    let today = new Date();
    let month = today.toLocaleString('default', { month: 'long' });
    let year = today.getFullYear();

    let totalRevenue = 0;

    payments.forEach(payment => {

        if (payment.month === month && payment.year === year) {

            totalRevenue += payment.amount;

        }

    });

    revenueElement.innerText = "₹" + totalRevenue;

}
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

//PAYMENT SYSTEM


const paymentForm = document.getElementById("paymentForm");

if (paymentForm) {

    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    let members = JSON.parse(localStorage.getItem("members")) || [];
    let plans = JSON.parse(localStorage.getItem("plans")) || [];

    const paymentMember = document.getElementById("paymentMember");
    const paymentPlan = document.getElementById("paymentPlan");
    const paymentAmount = document.getElementById("paymentAmount");
    const tableBody = document.querySelector("#paymentsTable tbody");


    // LOAD MEMBERS
    members.forEach(member => {

        let option = document.createElement("option");
        option.value = member.name;
        option.textContent = member.name;

        paymentMember.appendChild(option);

    });


    // LOAD PLANS
    plans.forEach(plan => {

        let option = document.createElement("option");
        option.value = plan.name;
        option.textContent = plan.name;

        paymentPlan.appendChild(option);

    });


    // MEMBER CHANGE → AUTO PLAN + PRICE
    paymentMember.addEventListener("change", function () {

        let selectedMember = paymentMember.value;

        let memberData = members.find(m => m.name === selectedMember);

        if (memberData) {

            paymentPlan.value = memberData.plan;

            let planData = plans.find(p => p.name === memberData.plan);

            if (planData) {
                paymentAmount.value = planData.price;
            }

        }

    });


    // RENDER TABLE
    function renderPayments() {

        tableBody.innerHTML = "";

        payments.forEach(payment => {

            let color = "green";

            if (payment.status === "Partial") color = "orange";
            if (payment.status === "Unpaid") color = "red";

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${payment.member}</td>
<td>${payment.plan}</td>
<td>${payment.month} ${payment.year}</td>
<td>₹${payment.amount}</td>
<td style="color:${color};font-weight:bold;">${payment.status}</td>
<td style="color:red;font-weight:bold;">₹${payment.due}</td>
`;

            tableBody.appendChild(row);

        });

    }


    // RECORD PAYMENT
    paymentForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let member = paymentMember.value;
        let plan = paymentPlan.value;
        let amountPaid = parseInt(paymentAmount.value) || 0;

        if (member === "" || plan === "") {
            alert("Select member");
            return;
        }

        let today = new Date();
        let month = today.toLocaleString('default', { month: 'long' });
        let year = today.getFullYear();

        let planData = plans.find(p => p.name === plan);
        let planPrice = parseInt(planData.price);


        // FIND PAYMENT FOR SAME MONTH
        let payment = payments.find(p =>
            p.member === member &&
            p.month === month &&
            p.year === year
        );


        // IF RECORD EXISTS
        if (payment) {

            // already paid
            if (payment.due === 0) {
                alert("Payment already completed for this month");
                return;
            }

            // cannot pay more than due
            if (amountPaid > payment.due) {
                alert("You can only pay remaining due: ₹" + payment.due);
                return;
            }

            // update partial payment
            payment.amount += amountPaid;

            payment.due = planPrice - payment.amount;

            if (payment.due === 0) {
                payment.status = "Paid";
            } else {
                payment.status = "Partial";
            }

        } else {

            // CREATE NEW PAYMENT

            let due = planPrice - amountPaid;

            let status = "Paid";

            if (amountPaid === 0) {
                status = "Unpaid";
                due = planPrice;
            }
            else if (amountPaid < planPrice) {
                status = "Partial";
            }

            payments.push({
                member: member,
                plan: plan,
                month: month,
                year: year,
                amount: amountPaid,
                due: due,
                status: status
            });

        }

        localStorage.setItem("payments", JSON.stringify(payments));

        renderPayments();

        paymentForm.reset();

    });


    renderPayments();

}
// REVENUE CHART

const revenueChartCanvas = document.getElementById("revenueChart");

if (revenueChartCanvas) {

    let payments = JSON.parse(localStorage.getItem("payments")) || [];

    let monthlyRevenue = {};

    payments.forEach(payment => {

        let key = payment.month + " " + payment.year;

        if (!monthlyRevenue[key]) {
            monthlyRevenue[key] = 0;
        }

        monthlyRevenue[key] += payment.amount;

    });

    let labels = Object.keys(monthlyRevenue);
    let data = Object.values(monthlyRevenue);

    new Chart(revenueChartCanvas, {

        type: 'bar',

        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: data,
                borderWidth: 1
            }]
        },

        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }

    });

}