// ============================================================
// ATTENDANCE.JS — SUPABASE VERSION (MEMBERS)
// ============================================================

const memberSelect = document.getElementById("memberSelect");

// ---------------- LOAD MEMBERS DROPDOWN ----------------
async function loadMemberDropdown() {

    const { data, error } = await supabaseClient
        .from("members")
        .select("*");

    if (error) {
        console.log("MEMBERS ERROR:", error);
        return;
    }

    memberSelect.innerHTML = "<option value=''>Select Member</option>";

    data.forEach(member => {
        let option = document.createElement("option");
        option.value = member.name;
        option.textContent = member.name;
        memberSelect.appendChild(option);
    });
}

// ---------------- MARK ATTENDANCE ----------------
async function markAttendance() {

    let memberName = document.getElementById("memberSelect").value;
    let status = document.getElementById("statusSelect").value;

    if (!memberName) {
        alert("Select a member");
        return;
    }

    let today = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    // check duplicate
    const { data: existing } = await supabaseClient
        .from("attendance")
        .select("*")
        .eq("name", memberName)
        .eq("date", today);

    if (existing && existing.length > 0) {
        alert("Attendance already marked today");
        return;
    }

    // insert
    const { error } = await supabaseClient
        .from("attendance")
        .insert([{
            name: memberName,
            status: status,
            date: today,
            time: time
        }]);

    if (error) {
        console.log("ATTENDANCE ERROR:", error);
        alert(error.message);
        return;
    }

    alert("Attendance marked ✅");
    loadAttendance();
}

// ---------------- RENDER TABLE ----------------
async function loadAttendance() {

    const { data, error } = await supabaseClient
        .from("attendance")
        .select("*");

    if (error) {
        console.log("LOAD ERROR:", error);
        return;
    }

    let tableBody = document.querySelector("#attendanceTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    let selectedMonth = document.getElementById("monthFilter")?.value;

    data.forEach(record => {

        let parts = record.date.split("/"); // dd/mm/yyyy
        let recordMonth = parseInt(parts[1]) - 1;

        // 🔥 FILTER LOGIC
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
    await loadMemberDropdown();
    await loadAttendance();
});
document.getElementById("monthFilter")?.addEventListener("change", loadAttendance);