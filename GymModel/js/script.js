// ADMIN PAGE PROTECTION

if (window.location.pathname.includes("/admin/")) {

    let role = localStorage.getItem("role");

    if (role !== "admin") {

        window.location.href = "../index.html";

    }

}
// LOGIN SYSTEM


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();


        // ADMIN LOGIN
        if (username === "admin" && password === "1234") {

            window.location.href = "admin/dashboard.html";

            return;

        }


        // MEMBER LOGIN
        let members = JSON.parse(localStorage.getItem("members")) || [];

        let member = members.find(m => String(m.phone) === username);

        if (member) {

            localStorage.setItem("loggedMember", JSON.stringify(member));

            window.location.href = "member/dashboard.html";

            return;

        }

        alert("Invalid Login");

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
<td>${member.trainer || "-"}</td>
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
            let trainer = document.getElementById("trainerSelect").value;
            let trainers = JSON.parse(localStorage.getItem("trainers")) || [];

            if (trainer) {

                let trainerData = trainers.find(t => t.name === trainer);

                let assignedMembers = members.filter(m => m.trainer === trainer).length;

                if (trainerData && assignedMembers >= trainerData.capacity) {

                    alert("Trainer capacity reached");

                    return;

                }

            }
            members.push({
                id: Date.now(),
                name,
                phone,
                plan,
                trainer,
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

const trainerSelect = document.getElementById("trainerSelect");

if (trainerSelect) {

    let trainers = JSON.parse(localStorage.getItem("trainers")) || [];

    trainers.forEach(trainer => {

        let option = document.createElement("option");

        option.value = trainer.name;

        option.textContent = trainer.name;

        trainerSelect.appendChild(option);

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
//chart
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



// TRAINER MODE

const trainerForm = document.getElementById("trainerForm");

if (trainerForm) {

    let trainers = JSON.parse(localStorage.getItem("trainers")) || [];
    let members = JSON.parse(localStorage.getItem("members")) || [];

    const tableBody = document.querySelector("#trainersTable tbody");


    // RENDER TRAINERS TABLE

    function renderTrainers() {

        tableBody.innerHTML = "";

        trainers.forEach((trainer, index) => {

            let assignedMembers = members
                .filter(m => m.trainer === trainer.name)
                .map(m => m.name);

            let assignedCount = assignedMembers.length;

            let row = document.createElement("tr");

            row.innerHTML = `

<td>${trainer.name}</td>
<td>${trainer.phone}</td>
<td>${trainer.specialization}</td>
<td>${trainer.experience} yrs</td>
<td>${trainer.capacity}</td>

<td>${assignedCount}</td>

<td>${assignedMembers.length ? assignedMembers.join(", ") : "-"}</td>

<td>₹${trainer.salary}</td>

<td style="color:${trainer.salaryStatus === "Paid" ? "green" : "red"}">
${trainer.salaryStatus}
</td>

<td>
<button onclick="deleteTrainer(${index})">Delete</button>
</td>

`;

            tableBody.appendChild(row);

        });

    }


    // ADD TRAINER

    trainerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let name = document.getElementById("trainerName").value.trim();
        let phone = document.getElementById("trainerPhone").value;
        let specialization = document.getElementById("trainerSpecialization").value;
        let experience = document.getElementById("trainerExperience").value;
        let capacity = document.getElementById("trainerCapacity").value;
        let salary = document.getElementById("trainerSalary").value;
        let salaryStatus = document.getElementById("salaryStatus").value;


        // PREVENT DUPLICATE TRAINERS

        let exists = trainers.find(
            t => t.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {

            alert("Trainer already exists");

            return;

        }


        // ADD TRAINER OBJECT

        trainers.push({

            id: Date.now(),
            name,
            phone,
            specialization,
            experience,
            capacity,
            salary,
            salaryStatus

        });


        // SAVE DATA

        localStorage.setItem("trainers", JSON.stringify(trainers));

        renderTrainers();

        trainerForm.reset();

    });


    // DELETE TRAINER

    window.deleteTrainer = function (index) {

        trainers.splice(index, 1);

        localStorage.setItem("trainers", JSON.stringify(trainers));

        renderTrainers();

    };


    // INITIAL LOAD

    renderTrainers();

}

// TRAINER ATTENDANCE MODULE

const trainerSelectAttendance = document.getElementById("trainerSelectAttendance");

if (trainerSelectAttendance) {

    let trainers = JSON.parse(localStorage.getItem("trainers")) || [];

    trainers.forEach(trainer => {

        let option = document.createElement("option");

        option.value = trainer.name;
        option.textContent = trainer.name;

        trainerSelectAttendance.appendChild(option);

    });

}


function markTrainerAttendance() {

    let trainerName = document.getElementById("trainerSelectAttendance").value;
    let status = document.getElementById("trainerStatus").value;

    if (trainerName === "") {

        alert("Select a trainer");

        return;

    }

    let attendance = JSON.parse(localStorage.getItem("trainerAttendance")) || [];

    let today = new Date().toLocaleDateString();

    let alreadyMarked = attendance.find(record =>
        record.name === trainerName && record.date === today
    );

    if (alreadyMarked) {

        alert("Attendance already marked today");

        return;

    }

    let now = new Date();

    attendance.push({

        name: trainerName,
        status: status,
        date: today,
        time: now.toLocaleTimeString()

    });

    localStorage.setItem("trainerAttendance", JSON.stringify(attendance));

    renderTrainerAttendance();

}


function renderTrainerAttendance() {

    let tableBody = document.querySelector("#trainerAttendanceTable tbody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    let attendance = JSON.parse(localStorage.getItem("trainerAttendance")) || [];

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

renderTrainerAttendance();

//STORE MODE

const productForm = document.getElementById("productForm");

if (productForm) {

    let products = JSON.parse(localStorage.getItem("products")) || [];
    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    let members = JSON.parse(localStorage.getItem("members")) || [];

    const productsTable = document.querySelector("#productsTable tbody");
    const purchaseTable = document.querySelector("#purchaseTable tbody");
    const purchaseMember = document.getElementById("purchaseMember");
    const purchaseProduct = document.getElementById("purchaseProduct");


    // LOAD MEMBERS

    members.forEach(member => {

        let option = document.createElement("option");

        option.value = member.name;
        option.textContent = member.name;

        purchaseMember.appendChild(option);

    });


    // LOAD PRODUCTS IN DROPDOWN

    function loadProductsDropdown() {

        purchaseProduct.innerHTML = '<option value="">Select Product</option>';

        products.forEach(product => {

            let option = document.createElement("option");

            option.value = product.name;
            option.textContent = product.name;

            purchaseProduct.appendChild(option);

        });

    }


    // RENDER PRODUCTS TABLE

    function renderProducts() {

        productsTable.innerHTML = "";

        products.forEach(product => {

            let row = document.createElement("tr");

            row.innerHTML = `

<td>${product.name}</td>
<td>${product.category}</td>
<td>₹${product.price}</td>
<td>${product.stock}</td>

`;

            productsTable.appendChild(row);

        });

    }


    // ADD PRODUCT

    productForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let name = document.getElementById("productName").value;
        let price = document.getElementById("productPrice").value;
        let stock = document.getElementById("productStock").value;
        let category = document.getElementById("productCategory").value;


        // prevent duplicate products

        let exists = products.find(p => p.name === name);

        if (exists) {

            alert("Product already exists");

            return;

        }


        products.push({

            id: Date.now(),
            name,
            price,
            stock,
            category

        });

        localStorage.setItem("products", JSON.stringify(products));

        renderProducts();

        loadProductsDropdown();

        productForm.reset();

    });


    // RECORD PURCHASE

    function recordPurchase() {

        let member = purchaseMember.value;
        let productName = purchaseProduct.value;
        let quantity = parseInt(document.getElementById("purchaseQuantity").value);

        if (member === "" || productName === "") {

            alert("Select member and product");

            return;

        }

        let product = products.find(p => p.name === productName);

        if (product.stock < quantity) {

            alert("Not enough stock");

            return;

        }

        product.stock -= quantity;

        let total = product.price * quantity;

        let today = new Date().toLocaleDateString();

        purchases.push({

            member,
            product: productName,
            quantity,
            total,
            date: today

        });

        localStorage.setItem("products", JSON.stringify(products));
        localStorage.setItem("purchases", JSON.stringify(purchases));

        renderProducts();
        renderPurchases();

    }


    // RENDER PURCHASE TABLE

    function renderPurchases() {

        purchaseTable.innerHTML = "";

        purchases.forEach(p => {

            let row = document.createElement("tr");

            row.innerHTML = `

<td>${p.member}</td>
<td>${p.product}</td>
<td>${p.quantity}</td>
<td>₹${p.total}</td>
<td>${p.date}</td>

`;

            purchaseTable.appendChild(row);

        });

    }


    renderProducts();
    renderPurchases();
    loadProductsDropdown();


}

// DASHBOARD TRAINER COUNT

const trainerCount = document.getElementById("trainerCount");

if (trainerCount) {

    let trainers = JSON.parse(localStorage.getItem("trainers")) || [];

    trainerCount.textContent = trainers.length;

}
// MEMBER DASHBOARD

const welcome = document.getElementById("welcome");

if (welcome) {

    let member = JSON.parse(localStorage.getItem("loggedMember"));

    if (member) {

        document.getElementById("welcome").innerText = "Welcome " + member.name;

        document.getElementById("memberPlan").innerText = member.plan;

        document.getElementById("memberTrainer").innerText =
            member.trainer || "Not Assigned";

        document.getElementById("memberStart").innerText = member.startDate;

        document.getElementById("memberEnd").innerText = member.endDate;

    }


    // ATTENDANCE HISTORY

    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

    let attendanceTable =
        document.querySelector("#memberAttendance tbody");

    attendance
        .filter(a => a.name === member.name)
        .forEach(a => {

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${a.date}</td>
<td>${a.status}</td>
`;

            attendanceTable.appendChild(row);

        });


    // PAYMENT HISTORY

    let payments = JSON.parse(localStorage.getItem("payments")) || [];

    let paymentTable =
        document.querySelector("#memberPayments tbody");

    payments
        .filter(p => p.member === member.name)
        .forEach(p => {

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${p.month}</td>
<td>₹${p.amount}</td>
<td>${p.status}</td>
<td>₹${p.due}</td>
`;

            paymentTable.appendChild(row);

        });

}

function logout() {

    localStorage.removeItem("loggedMember");
    localStorage.removeItem("role");

    window.location.href = "../index.html";

}

// MEMBER STORE PURCHASES

let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

let purchaseTable =
    document.querySelector("#memberPurchases tbody");

if (purchaseTable) {

    purchases
        .filter(p => p.member === member.name)
        .forEach(p => {

            let row = document.createElement("tr");

            row.innerHTML = `
<td>${p.product}</td>
<td>${p.quantity}</td>
<td>₹${p.total}</td>
<td>${p.date}</td>
`;

            purchaseTable.appendChild(row);

        });

}
let today = new Date();
let endDate = new Date(member.endDate);

let diffTime = endDate - today;

let daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

let status = "Active";

if (daysLeft < 0) {
    status = "Expired";
}

else if (daysLeft <= 7) {
    status = "Expiring Soon";
}

document.getElementById("memberStatus").innerText = status;