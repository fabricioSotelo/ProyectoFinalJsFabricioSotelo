let products = [];
const productsContainer = document.getElementById("products-container");

function renderProducts(productsToRender) {
  if (!productsContainer) return;

  productsContainer.innerHTML = "";
  productsToRender.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "col-sm-6 col-md-4 col-lg-3 mb-4";
    productCard.innerHTML = `
      <div class="card h-100 shadow-sm rounded-lg overflow-hidden">
        <img src="${product.image}" class="card-img-top object-cover w-full" alt="${product.title}" style="height: 300px;">
        <div class="card-body d-flex flex-column p-4">
          <h5 class="card-title text-xl font-semibold mb-2">${product.title}</h5>
          <p class="card-text mb-1 text-gray-700">Marca: <strong>${product.brand || "No especificado"}</strong></p>
          <p class="card-text mb-1 text-gray-700">Tipo: <strong>${product.category}</strong></p>
          <p class="card-text mb-3 text-green-600 text-lg font-bold">Precio: <strong>$${product.price}</strong></p>

          <div class="d-flex align-items-center mb-3">
            <button class="btn btn-outline-secondary me-2 product-minus-btn">−</button>
            <input type="number" class="form-control text-center quantity" value="1" min="1" readonly style="max-width: 60px;" />
            <button class="btn btn-outline-secondary ms-2 product-plus-btn">+</button>
          </div>

          <button class="btn btn-primary mt-auto product-add-btn w-full" id="product-${product.id}">Comprar</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(productCard);
    addProductEvent(productCard, product);
  });
}

function addProductEvent(productCard, product) {
  const plusBtn = productCard.querySelector(".product-plus-btn");
  const minusBtn = productCard.querySelector(".product-minus-btn");
  const quantityInput = productCard.querySelector(".quantity");
  const addToCartBtn = productCard.querySelector(".product-add-btn");

  plusBtn.onclick = () => quantityInput.value = parseInt(quantityInput.value) + 1;
  minusBtn.onclick = () => {
    if (parseInt(quantityInput.value) > 1) {
      quantityInput.value = parseInt(quantityInput.value) - 1;
    }
  };

  addToCartBtn.onclick = () => {
    const quantity = parseInt(quantityInput.value);
    addProductToShoppingCart(product, quantity);
    quantityInput.value = 1;
  };
}

function addProductToShoppingCart(product, quantity) {
  let currentCart = [];

  try {
    const storedCart = localStorage.getItem("accionCarrito");
    currentCart = storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    currentCart = [];
  }

  const existingProductIndex = currentCart.findIndex(item => item.id === product.id);
  if (existingProductIndex !== -1) {
    currentCart[existingProductIndex].quantity += quantity;
  } else {
    currentCart.push({
      id: product.id,
      title: product.title,
      image: product.image,
      brand: product.brand,
      category: product.category,
      price: product.price,
      quantity: quantity
    });
  }

  localStorage.setItem("accionCarrito", JSON.stringify(currentCart));
  
  Toastify({
    text: "🎮 Producto añadido al carrito",
    duration: 3000,
    gravity: "bottom",
    position: "right",
    backgroundColor: "#4caf50",
  }).showToast();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (productsContainer) {
    try {
      const response = await fetch("./db/productos.json");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      products = await response.json();
      renderProducts(products);
    } catch (error) {
      productsContainer.innerHTML = `<p class="text-danger text-center col-span-full">No se pudo cargar los productos.</p>`;
    }
  }
});