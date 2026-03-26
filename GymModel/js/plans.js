// ============================================================
// PLANS.JS — Create and display membership plans
// ============================================================

const planForm = document.getElementById("planForm");

if (planForm) {
    let plans = JSON.parse(localStorage.getItem("plans")) || [];

    const tableBody = document.querySelector("#plansTable tbody");

    // --- Render ---
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

    // --- Add plan ---
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