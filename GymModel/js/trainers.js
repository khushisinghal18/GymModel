
// TRAINERS


const trainerForm = document.getElementById("trainerForm");
const tableBody = document.querySelector("#trainersTable tbody");

let trainers = [];
let members = [];

// ---------------- LOAD MEMBERS ----------------
async function loadMembers() {
    const { data, error } = await supabaseClient
        .from("members")
        .select("*");

    if (error) {
        console.log("MEMBERS ERROR:", error);
        return;
    }

    members = data || [];
}

// ---------------- LOAD TRAINERS ----------------
async function loadTrainers() {
    const { data, error } = await supabaseClient
        .from("trainers")
        .select("*");

    if (error) {
        console.log("LOAD ERROR:", error);
        return;
    }

    trainers = data || [];
    renderTrainers();
}

// ---------------- RENDER ----------------
function renderTrainers() {
    if (!tableBody) return;

    tableBody.innerHTML = "";

    trainers.forEach((trainer, index) => {

        let assignedMembers = members
            .filter(m =>
                m.trainer?.trim().toLowerCase() ===
                trainer.name?.trim().toLowerCase()
            )
            .map(m => m.name);

        let assignedCount = assignedMembers.length;

        let isPaid = trainer.salary_status === "Paid";
        let statusColor = isPaid ? "green" : "red";
        let toggleLabel = isPaid ? "Mark Unpaid" : "Mark Paid";

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${trainer.name}</td>
            <td>${trainer.phone}</td>
            <td>${trainer.specialization || "-"}</td>
            <td>${trainer.experience || "-"}</td>
            <td>${trainer.capacity || "-"}</td>
            <td>${assignedCount}</td>
            <td>${assignedMembers.length ? assignedMembers.join(", ") : "-"}</td>
            <td>₹${trainer.salary || 0}</td>

            <td style="color:${statusColor}; font-weight:bold;">
                ${trainer.salary_status}
            </td>

            <td>
                <button onclick="toggleSalary(${index})">${toggleLabel}</button>
                <button onclick="deleteTrainer(${index})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// ---------------- ADD TRAINER ----------------
if (trainerForm) {
    trainerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        let name = document.getElementById("trainerName").value.trim();
        let phone = document.getElementById("trainerPhone").value;
        let specialization = document.getElementById("trainerSpecialization").value;
        let experience = parseInt(document.getElementById("trainerExperience").value);
        let capacity = parseInt(document.getElementById("trainerCapacity").value);
        let salary = parseInt(document.getElementById("trainerSalary").value);
        let salaryStatus = document.getElementById("salaryStatus").value;

        // ✅ CHECK DUPLICATE IN DATABASE
        const { data: existing } = await supabaseClient
            .from("trainers")
            .select("*")
            .eq("phone", phone);

        if (existing && existing.length > 0) {
            alert("Trainer already exists");
            return;
        }

        // ✅ INSERT
        const { data, error } = await supabaseClient
            .from("trainers")
            .insert([{
                name,
                phone,
                specialization,
                experience,
                capacity,
                salary,
                salary_status: salaryStatus
            }])
            .select();

        if (error) {
            console.log("INSERT ERROR:", error);
            alert(error.message);
            return;
        }

        await loadTrainers(); // refresh properly
        trainerForm.reset();
    });
}

// ---------------- DELETE TRAINER + CLEAN MEMBERS ----------------
window.deleteTrainer = async function (index) {

    let trainer = trainers[index];

    console.log("Deleting trainer:", trainer.name);

    // 1️⃣ REMOVE FROM MEMBERS (IMPORTANT)
    const { error: memberError } = await supabaseClient
        .from("members")
        .update({ trainer: null })
        .eq("trainer", trainer.name);

    if (memberError) {
        alert(memberError.message);
        return;
    }

    // 2️⃣ DELETE TRAINER
    const { error } = await supabaseClient
        .from("trainers")
        .delete()
        .eq("id", trainer.id)
        .select();

    if (error) {
        console.log("DELETE ERROR:", error);
        alert(error.message);
        return;
    }

    // 3️⃣ REFRESH DATA
    await loadMembers();
    await loadTrainers();

    console.log("Deleted + cleaned ✅");
};

// ---------------- TOGGLE SALARY ----------------
window.toggleSalary = async function (index) {

    let trainer = trainers[index];

    let newStatus = trainer.salary_status === "Paid" ? "Unpaid" : "Paid";

    const { error } = await supabaseClient
        .from("trainers")
        .update({ salary_status: newStatus })
        .eq("id", trainer.id)
        .select();

    if (error) {
        console.log("UPDATE ERROR:", error);
        return;
    }

    await loadTrainers();
};

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadMembers();   // FIRST
    await loadTrainers();  // THEN
});