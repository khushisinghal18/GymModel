// PLANS
const planForm = document.getElementById("planForm");
const tableBody = document.querySelector("#plansTable tbody");

let plans = [];

// ---------------- LOAD ----------------
async function loadPlans() {

    const { data, error } = await supabaseClient
        .from("plans")
        .select("*");

    if (error) {
        alert(error.message);
        return;
    }

    plans = data || [];
    renderPlans();
}

// ---------------- RENDER ----------------
function renderPlans() {

    tableBody.innerHTML = "";

    plans.forEach(plan => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${plan.name}</td>
            <td>₹${plan.price}</td>
            <td>${plan.duration} days</td>
        `;

        tableBody.appendChild(row);
    });
}

// ---------------- ADD ----------------
if (planForm) {

    planForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        let name = document.getElementById("planName").value.trim();
        let price = parseInt(document.getElementById("planPrice").value);
        let duration = parseInt(document.getElementById("planDuration").value);

        if (!name || !price || !duration) {
            alert("Fill all fields");
            return;
        }

        // 🔥 PREVENT DUPLICATES
        let exists = plans.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (exists) {
            alert("Plan already exists");
            return;
        }

        const { error } = await supabaseClient
            .from("plans")
            .insert([{ name, price, duration }]);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Plan Added ✅");

        planForm.reset();
        loadPlans();
    });
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", loadPlans);