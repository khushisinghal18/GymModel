// ============================================================
// AUTH.JS — Login system & admin page protection
// ============================================================

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
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();

        // Admin login
        if (username === "admin" && password === "1234") {
            localStorage.setItem("role", "admin");
            window.location.href = "admin/dashboard.html";
            return;
        }

        // Member login (phone number as username)
        const { data, error } = await supabaseClient
            .from("members")
            .select("*")
            .eq("phone", username)
            .single();

        if (error || !data) {
            alert("Invalid Login");
            return;
        }

        localStorage.setItem("loggedMember", JSON.stringify(data));

        window.location.href = "member/dashboard.html";
        if (member) {
            localStorage.setItem("loggedMember", JSON.stringify(member));
            window.location.href = "member/dashboard.html";
            return;
        }

        alert("Invalid Login");
    });
}

// LOGOUT
function logout() {
    localStorage.removeItem("loggedMember");
    localStorage.removeItem("role");
    window.location.href = "../index.html";
}