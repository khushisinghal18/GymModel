// ============================================================
// MEMBERS.JS — CLEAN FINAL (Supabase + Dropdown FIXED)
// ============================================================

const memberForm = document.getElementById("memberForm");

if (memberForm) {

    let members = [];
    let editIndex = -1;

    const tableBody = document.querySelector("#membersTable tbody");
    const planSelect = document.getElementById("planSelect");
    const trainerSelect = document.getElementById("trainerSelect");

    // ---------------- LOAD MEMBERS ----------------
    async function loadMembers() {

        const { data, error } = await supabaseClient
            .from("members")
            .select("*");

        if (error) {
            console.log("ERROR:", error);
            return;
        }

        members = data || [];
        renderMembers();
    }

    // ---------------- LOAD TRAINER DROPDOWN ----------------
    async function loadTrainerDropdown() {

        const { data, error } = await supabaseClient
            .from("trainers")
            .select("*");

        console.log("TRAINERS:", data); // DEBUG

        if (error) {
            console.log("TRAINER DROPDOWN ERROR:", error);
            return;
        }

        if (!trainerSelect) return;

        trainerSelect.innerHTML = "<option value=''>Assign Trainer</option>";

        data.forEach(trainer => {
            let option = document.createElement("option");
            option.value = trainer.name;   // keep same for now
            option.textContent = trainer.name;
            trainerSelect.appendChild(option);
        });
    }

    // ---------------- PLAN DROPDOWN (localStorage OK) ----------------
    let plans = JSON.parse(localStorage.getItem("plans")) || [];

    if (planSelect) {
        plans.forEach(plan => {
            let option = document.createElement("option");
            option.value = plan.name;
            option.textContent = plan.name + " (" + plan.duration + " days)";
            planSelect.appendChild(option);
        });
    }

    // ---------------- RENDER MEMBERS ----------------
    function renderMembers() {

        tableBody.innerHTML = "";

        members.forEach((member, index) => {

            let status = "-";
            let color = "black";

            if (member.end_date) {
                let today = new Date();
                let endDate = new Date(member.end_date);
                let diffTime = endDate - today;
                let daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (daysLeft < 0) {
                    status = "Expired";
                    color = "red";
                } else if (daysLeft <= 7) {
                    status = "Expiring Soon";
                    color = "orange";
                } else {
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
                <td>${member.start_date || "-"}</td>
                <td>${member.end_date || "-"}</td>
                <td style="color:${color}; font-weight:bold;">${status}</td>
                <td class="actions">
                    <button onclick="editMember(${index})">✏️</button>
                    <button onclick="deleteMember(${index})">🗑️</button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // ---------------- ADD / EDIT MEMBER ----------------
    memberForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        let name = document.getElementById("name").value;
        let phone = document.getElementById("phone").value;
        let plan = document.getElementById("planSelect").value;
        let trainer = document.getElementById("trainerSelect").value;

        let today = new Date();
        let startDate = today.toLocaleDateString();
        let endDate = today.toLocaleDateString();

        // DUPLICATE CHECK
        let exists = members.find(m => m.phone === phone);

        if (exists && editIndex === -1) {
            alert("Member already exists with this phone");
            return;
        }

        if (editIndex === -1) {

            // INSERT
            const { data, error } = await supabaseClient
                .from("members")
                .insert([{
                    name,
                    phone,
                    plan,
                    trainer,
                    start_date: startDate,
                    end_date: endDate
                }])
                .select();

            if (error) {
                console.log("INSERT ERROR:", error);
                alert(error.message);
                return;
            }

            members.push(data[0]);

        } else {

            let oldMember = members[editIndex];

            const { error } = await supabaseClient
                .from("members")
                .update({
                    name,
                    phone,
                    plan,
                    trainer
                })
                .eq("id", oldMember.id)
                .select();

            if (error) {
                console.log("UPDATE ERROR:", error);
                alert(error.message);
                return;
            }

            members[editIndex].name = name;
            members[editIndex].phone = phone;
            members[editIndex].plan = plan;
            members[editIndex].trainer = trainer;

            editIndex = -1;
        }

        renderMembers();
        memberForm.reset();
    });

    // ---------------- DELETE ----------------
    window.deleteMember = async function (index) {

        let member = members[index];

        const { error } = await supabaseClient
            .from("members")
            .delete()
            .eq("id", member.id)
            .select();

        if (error) {
            console.log("DELETE ERROR:", error);
            alert(error.message);
            return;
        }

        await loadMembers();
    }

    // ---------------- EDIT ----------------
    window.editMember = function (index) {
        let member = members[index];

        document.getElementById("name").value = member.name;
        document.getElementById("phone").value = member.phone;
        document.getElementById("planSelect").value = member.plan;
        document.getElementById("trainerSelect").value = member.trainer;

        editIndex = index;
    };

    // ---------------- INIT ----------------
    document.addEventListener("DOMContentLoaded", async () => {
        await loadMembers();
        await loadTrainerDropdown();
    });
}

// ---------------- SEARCH ----------------
const memberSearch = document.getElementById("memberSearch");

if (memberSearch) {
    memberSearch.addEventListener("keyup", function () {

        let value = this.value.toLowerCase();
        let rows = document.querySelectorAll("#membersTable tbody tr");

        rows.forEach(row => {
            let name = row.children[0].innerText.toLowerCase();
            row.style.display = name.includes(value) ? "" : "none";
        });
    });
}