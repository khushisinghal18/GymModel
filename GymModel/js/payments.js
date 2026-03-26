// PAYMENTS

const paymentForm = document.getElementById("paymentForm");

if (paymentForm) {

    let payments = [];
    let members = [];
    let plans = JSON.parse(localStorage.getItem("plans")) || []; // ok for now

    const paymentMember = document.getElementById("paymentMember");
    const paymentPlan = document.getElementById("paymentPlan");
    const paymentAmount = document.getElementById("paymentAmount");
    const tableBody = document.querySelector("#paymentsTable tbody");

    // ================= LOAD MEMBERS =================
    async function loadMembers() {

        const { data, error } = await supabaseClient
            .from("members")
            .select("*");

        if (error) {
            console.log("MEMBERS ERROR:", error);
            return;
        }

        members = data || [];

        paymentMember.innerHTML = "<option value=''>Select Member</option>";

        members.forEach(member => {
            let option = document.createElement("option");
            option.value = member.name;
            option.textContent = member.name;
            paymentMember.appendChild(option);
        });
    }

    // ================= LOAD PAYMENTS =================
    async function loadPayments() {

        const { data, error } = await supabaseClient
            .from("payments")
            .select("*");

        if (error) {
            console.log("LOAD ERROR:", error);
            return;
        }

        payments = data || [];
        renderPayments();
    }

    // ================= PLAN AUTO FILL =================
    paymentMember.addEventListener("change", function () {

        let memberData = members.find(m => m.name === paymentMember.value);

        if (memberData) {

            paymentPlan.innerHTML = `<option value="${memberData.plan}">${memberData.plan}</option>`;
            paymentPlan.value = memberData.plan;

            let planData = plans.find(p => p.name === memberData.plan);

            if (planData) {
                paymentAmount.value = planData.price;
            }
        }
    });

    // ================= RENDER =================
    function renderPayments() {

        tableBody.innerHTML = "";

        let selectedMonth = document.getElementById("monthFilter")?.value;

        payments.forEach(payment => {

            let paymentMonth = new Date(`${payment.month} 1, ${payment.year}`).getMonth();

            // 🔥 FILTER
            if (selectedMonth !== "" && paymentMonth != selectedMonth) return;

            let color = "green";
            if (payment.status === "Partial") color = "orange";
            if (payment.status === "Unpaid") color = "red";

            let row = document.createElement("tr");

            row.innerHTML = `
        <td>${payment.member}</td>
        <td>${payment.plan}</td>
        <td>${payment.month} ${payment.year}</td>
        <td>₹${payment.amount}</td>
        <td style="color:${color}; font-weight:bold;">${payment.status}</td>
        <td style="color:red;">₹${payment.due}</td>
    `;

            tableBody.appendChild(row);
        });
    }

    // ================= SUBMIT =================
    paymentForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        let member = paymentMember.value;
        let plan = paymentPlan.value;
        let amountPaid = parseInt(paymentAmount.value) || 0;

        if (!member || !plan) {
            alert("Select member");
            return;
        }

        let today = new Date();
        let month = today.toLocaleString("default", { month: "long" });
        let year = today.getFullYear();

        let planData = plans.find(p => p.name === plan);
        let planPrice = parseInt(planData.price);

        // 🔍 CHECK EXISTING FROM DB
        const { data: existingData } = await supabaseClient
            .from("payments")
            .select("*")
            .eq("member", member)
            .eq("month", month)
            .eq("year", year);

        let existing = existingData?.[0];

        if (existing) {

            if (existing.due === 0) {
                alert("Already paid");
                return;
            }

            if (amountPaid > existing.due) {
                alert("Max allowed: ₹" + existing.due);
                return;
            }

            let newAmount = existing.amount + amountPaid;
            let newDue = planPrice - newAmount;
            let newStatus = newDue === 0 ? "Paid" : "Partial";

            const { error } = await supabaseClient
                .from("payments")
                .update({
                    amount: newAmount,
                    due: newDue,
                    status: newStatus
                })
                .eq("id", existing.id)
                .select();

            if (error) {
                alert(error.message);
                return;
            }

        } else {

            let due = planPrice - amountPaid;
            let status = "Paid";

            if (amountPaid === 0) {
                status = "Unpaid";
                due = planPrice;
            }
            else if (amountPaid < planPrice) {
                status = "Partial";
            }

            const { error } = await supabaseClient
                .from("payments")
                .insert([{
                    member,
                    plan,
                    month,
                    year,
                    amount: amountPaid,
                    due,
                    status
                }])
                .select();

            if (error) {
                alert(error.message);
                return;
            }
        }

        await loadPayments();
        paymentAmount.value = "";
    });

    // ================= INIT =================
    document.addEventListener("DOMContentLoaded", async () => {
        await loadMembers();
        await loadPayments();
    });
}
document.getElementById("monthFilter")?.addEventListener("change", renderPayments);