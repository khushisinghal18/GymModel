// STORE

const productForm = document.getElementById("productForm");

let products = [];
let members = [];

// ---------------- LOAD PRODUCTS ----------------
async function loadProducts() {

    const { data, error } = await supabaseClient
        .from("products")
        .select("*");

    if (error) {
        alert(error.message);
        return;
    }

    products = data || [];

    let table = document.querySelector("#productsTable tbody");
    table.innerHTML = "";

    products.forEach(p => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₹${p.price}</td>
            <td>${p.stock}</td>
        `;

        table.appendChild(row);
    });

    loadProductDropdown();
}

// ---------------- LOAD MEMBERS ----------------
async function loadMembers() {

    const { data } = await supabaseClient
        .from("members")
        .select("*");

    members = data || [];

    let select = document.getElementById("purchaseMember");

    select.innerHTML = "<option value=''>Select Member</option>";

    members.forEach(m => {
        let option = document.createElement("option");
        option.value = m.name;
        option.textContent = m.name;
        select.appendChild(option);
    });
}

// ---------------- PRODUCT DROPDOWN ----------------
function loadProductDropdown() {

    let select = document.getElementById("purchaseProduct");

    select.innerHTML = "<option value=''>Select Product</option>";

    products.forEach(p => {
        let option = document.createElement("option");
        option.value = p.name;
        option.textContent = p.name;
        select.appendChild(option);
    });
}

// ---------------- ADD PRODUCT ----------------
if (productForm) {

    productForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        let name = document.getElementById("productName").value.trim();
        let price = parseInt(document.getElementById("productPrice").value);
        let stock = parseInt(document.getElementById("productStock").value);
        let category = document.getElementById("productCategory").value;

        if (!name || !price || !stock) {
            alert("Fill all fields");
            return;
        }

        let exists = products.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (exists) {
            alert("Product already exists");
            return;
        }

        const { error } = await supabaseClient
            .from("products") // ✅ FIXED
            .insert([{ name, price, stock, category }]);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Product Added ✅");

        productForm.reset();
        loadProducts();
    });
}

// ---------------- PURCHASE ----------------
window.recordPurchase = async function () {

    let member = document.getElementById("purchaseMember").value;
    let product = document.getElementById("purchaseProduct").value;
    let quantity = parseInt(document.getElementById("purchaseQuantity").value);

    if (!member || !product || !quantity) {
        alert("Fill all fields");
        return;
    }

    let productData = products.find(p => p.name === product);

    if (!productData) return;

    if (quantity > productData.stock) {
        alert("Not enough stock");
        return;
    }

    let total = productData.price * quantity;
    let today = new Date().toLocaleDateString();

    // INSERT PURCHASE
    await supabaseClient.from("purchases").insert([{
        member,
        product,
        quantity,
        total,
        date: today
    }]);

    // UPDATE STOCK
    await supabaseClient
        .from("products")
        .update({ stock: productData.stock - quantity })
        .eq("id", productData.id);

    alert("Purchase recorded ✅");

    loadProducts();
    loadPurchases();
};

// ---------------- LOAD PURCHASES ----------------
async function loadPurchases() {

    const { data, error } = await supabaseClient
        .from("purchases") // ✅ FIXED
        .select("*");

    if (error) {
        alert(error.message);
        return;
    }

    let table = document.querySelector("#purchaseTable tbody");
    table.innerHTML = "";

    data.forEach(p => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.member}</td>
            <td>${p.product}</td>
            <td>${p.quantity}</td>
            <td>₹${p.total}</td>
            <td>${p.date}</td>
        `;

        table.appendChild(row);
    });
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();
    await loadMembers();
    await loadPurchases();
});