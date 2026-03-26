// ============================================================
// TRAINER ATTENDANCE — FINAL WORKING
// ============================================================

// ---------------- LOAD TRAINERS ----------------
async function loadTrainerDropdown() {

    const trainerSelect = document.getElementById("trainerSelectAttendance");

    if (!trainerSelect) {
        console.log("Dropdown not found ❌");
        return;
    }

    const { data, error } = await supabaseClient
        .from("trainers")
        .select("*");

    console.log("TRAINERS:", data); // DEBUG

    if (error) {
        alert(error.message);
        return;
    }

    trainerSelect.innerHTML = "<option value=''>Select Trainer</option>";

    data.forEach(trainer => {
        let option = document.createElement("option");
        option.value = trainer.name;
        option.textContent = trainer.name;
        trainerSelect.appendChild(option);
    });
}

// ---------------- MARK ATTENDANCE ----------------
async function markTrainerAttendance() {

    let trainerName = document.getElementById("trainerSelectAttendance").value;
    let status = document.getElementById("trainerStatus").value;

    if (!trainerName) {
        alert("Select trainer");
        return;
    }

    let today = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    // check duplicate
    const { data: existing } = await supabaseClient
        .from("trainer_attendance")
        .select("*")
        .eq("name", trainerName)
        .eq("date", today);

    if (existing && existing.length > 0) {
        alert("Already marked today");
        return;
    }

    // insert
    const { error } = await supabaseClient
        .from("trainer_attendance")
        .insert([{
            name: trainerName,
            status: status,
            date: today,
            time: time
        }]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Trainer attendance marked ✅");
    loadTrainerAttendance();
}

// ---------------- RENDER TABLE ----------------
async function loadTrainerAttendance() {

    const { data, error } = await supabaseClient
        .from("trainer_attendance")
        .select("*");

    if (error) {
        console.log(error);
        return;
    }

    let tableBody = document.querySelector("#trainerAttendanceTable tbody");

    tableBody.innerHTML = "";

    let selectedMonth = document.getElementById("monthFilter")?.value;

    data.forEach(record => {

        let parts = record.date.split("/");
        let recordMonth = parseInt(parts[1]) - 1;

        // 🔥 FILTER
        if (selectedMonth !== "" && recordMonth != selectedMonth) return;

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

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadTrainerDropdown();
    await loadTrainerAttendance();
});
document.getElementById("monthFilter")?.addEventListener("change", loadTrainerAttendance);