// ============================================================
// STORE.JS — Products inventory + member purchases
// ============================================================

const productForm = document.getElementById("productForm");

if (productForm) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    let members = JSON.parse(localStorage.getItem("members")) || [];

    const productsTable = document.querySelector("#productsTable tbody");
    const purchaseTable = document.querySelector("#purchaseTable tbody");
    const purchaseMember = document.getElementById("purchaseMember");
    const purchaseProduct = document.getElementById("purchaseProduct");

    // Load member dropdown
    members.forEach(member => {
        let option = document.createElement("option");
        option.value = member.name;
        option.textContent = member.name;
        purchaseMember.appendChild(option);
    });

    // Load product dropdown
    function loadProductsDropdown() {
        purchaseProduct.innerHTML = '<option value="">Select Product</option>';
        products.forEach(product => {
            let option = document.createElement("option");
            option.value = product.name;
            option.textContent = product.name;
            purchaseProduct.appendChild(option);
        });
    }

    // --- Render products table ---
    function renderProducts() {
        productsTable.innerHTML = "";
        products.forEach(product => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
            `;
            productsTable.appendChild(row);
        });
    }

    // --- Add product ---
    productForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let name = document.getElementById("productName").value;
        let price = document.getElementById("productPrice").value;
        let stock = document.getElementById("productStock").value;
        let category = document.getElementById("productCategory").value;

        let exists = products.find(p => p.name === name);
        if (exists) {
            alert("Product already exists");
            return;
        }

        products.push({ id: Date.now(), name, price, stock, category });

        localStorage.setItem("products", JSON.stringify(products));
        renderProducts();
        loadProductsDropdown();
        productForm.reset();
    });

    // --- Record purchase ---
    window.recordPurchase = function () {
        let member = purchaseMember.value;
        let productName = purchaseProduct.value;
        let quantity = parseInt(document.getElementById("purchaseQuantity").value);

        if (member === "" || productName === "") {
            alert("Select member and product");
            return;
        }

        let product = products.find(p => p.name === productName);

        if (product.stock < quantity) {
            alert("Not enough stock");
            return;
        }

        product.stock -= quantity;

        let total = product.price * quantity;
        let today = new Date().toLocaleDateString();

        purchases.push({ member, product: productName, quantity, total, date: today });

        localStorage.setItem("products", JSON.stringify(products));
        localStorage.setItem("purchases", JSON.stringify(purchases));

        renderProducts();
        renderPurchases();
    };

    // --- Render purchases table ---
    function renderPurchases() {
        purchaseTable.innerHTML = "";
        purchases.forEach(p => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${p.member}</td>
                <td>${p.product}</td>
                <td>${p.quantity}</td>
                <td>₹${p.total}</td>
                <td>${p.date}</td>
            `;
            purchaseTable.appendChild(row);
        });
    }

    renderProducts();
    renderPurchases();
    loadProductsDropdown();
}