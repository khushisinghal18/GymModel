// ============================================================
// DASHBOARD.JS — SUPABASE VERSION (FINAL)
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ---------------- FETCH DATA ----------------
    const { data: members } = await supabaseClient.from("members").select("*");
    const { data: payments } = await supabaseClient.from("payments").select("*");
    const { data: attendance } = await supabaseClient.from("attendance").select("*");
    const { data: trainers } = await supabaseClient.from("trainers").select("*");

    let today = new Date();
    let month = today.toLocaleString("default", { month: "long" });
    let year = today.getFullYear();

    // ---------------- TOTAL MEMBERS ----------------
    const memberCount = document.getElementById("memberCount");
    if (memberCount) memberCount.textContent = members?.length || 0;

    // ---------------- TOTAL TRAINERS ----------------
    const trainerCount = document.getElementById("trainerCount");
    if (trainerCount) trainerCount.textContent = trainers?.length || 0;

    // ---------------- UNPAID MEMBERS ----------------
    const unpaidMembers = document.getElementById("unpaidMembers");

    if (unpaidMembers) {

        let unpaidCount = 0;

        members?.forEach(member => {

            let payment = payments?.find(p =>
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

    // ---------------- MONTHLY REVENUE ----------------
    const revenueElement = document.getElementById("monthlyRevenue");

    if (revenueElement) {

        let totalRevenue = 0;

        payments?.forEach(payment => {
            if (payment.month === month && payment.year === year) {
                totalRevenue += payment.amount || 0;
            }
        });

        revenueElement.innerText = "₹" + totalRevenue;
    }

    // ---------------- TODAY ATTENDANCE ----------------
    const todayAttendance = document.getElementById("todayAttendance");

    if (todayAttendance) {

        let todayStr = today.toLocaleDateString();

        let todayCount = attendance?.filter(r =>
            r.date === todayStr && r.status === "Present"
        ).length || 0;

        todayAttendance.innerText = todayCount;
    }

    // ---------------- REVENUE CHART ----------------
    const revenueChartCanvas = document.getElementById("revenueChart");

    if (revenueChartCanvas) {

        let monthlyRevenue = {};

        payments?.forEach(payment => {
            let key = payment.month + " " + payment.year;

            if (!monthlyRevenue[key]) {
                monthlyRevenue[key] = 0;
            }

            monthlyRevenue[key] += payment.amount || 0;
        });

        new Chart(revenueChartCanvas, {
            type: "bar",
            data: {
                labels: Object.keys(monthlyRevenue),
                datasets: [{
                    label: "Monthly Revenue",
                    data: Object.values(monthlyRevenue),
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

});