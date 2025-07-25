let accionCarrito;
try {
  const storedCart = localStorage.getItem("accionCarrito");
  accionCarrito = storedCart ? JSON.parse(storedCart) : [];
} catch (error) {
  accionCarrito = [];
}

document.addEventListener("DOMContentLoaded", () => {
  const shoppingCartBody = document.getElementById("shopping-cart-body");
  const totalPrice = document.getElementById("total-price");
  const checkoutButton = document.getElementById("checkout-btn");
  const emptyCartMessage = document.getElementById("empty-cart-message");

  function renderCartShopping() {
    if (!shoppingCartBody || !totalPrice || !checkoutButton || !emptyCartMessage) return;

    if (!accionCarrito.length) {
      emptyCartMessage.style.display = "block";
      shoppingCartBody.innerHTML = "";
      totalPrice.textContent = "0.00";
      checkoutButton.disabled = true;
      return;
    } else {
      emptyCartMessage.style.display = "none";
      checkoutButton.disabled = false;
    }

    let total = 0;
    shoppingCartBody.innerHTML = "";

    accionCarrito.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      // Ajuste de ruta para que las imágenes se vean desde /pages/
      const imagePath = item.image.startsWith("assets/")
        ? "../" + item.image
        : item.image;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${imagePath}" alt="${item.title}" class="img-fluid" style="max-width: 60px;"></td>
        <td class="align-middle">${item.title}</td>
        <td class="align-middle">${item.brand || "Sin marca"}</td>
        <td class="align-middle">$${item.price.toFixed(2)}</td>
        <td class="align-middle">
          <input type="number" class="form-control text-center quantity-input" id="${item.id}" value="${item.quantity}" min="1" style="width: 80px; margin: auto;">
        </td>
        <td class="align-middle">
          <button class="btn btn-outline-danger btn-sm remove-item-btn" data-id="${item.id}">Eliminar</button>
        </td>
      `;
      shoppingCartBody.appendChild(row);
      addQuantityEvent(row);
      addRemoveEvent(row);
    });

    totalPrice.textContent = total.toFixed(2);
  }

  function addQuantityEvent(row) {
    const input = row.querySelector(".quantity-input");
    if (input) {
      input.onchange = (e) => {
        const id = parseInt(e.target.id);
        let newQty = parseInt(e.target.value);
        if (isNaN(newQty) || newQty < 1) {
          newQty = 1;
          e.target.value = 1;
        }
        const index = accionCarrito.findIndex((item) => item.id === id);
        if (index !== -1) {
          accionCarrito[index].quantity = newQty;
          updateCartShopping();
        }
      };
    }
  }

  function addRemoveEvent(row) {
    const removeButton = row.querySelector(".remove-item-btn");
    if (removeButton) {
      removeButton.onclick = (e) => {
        const idToRemove = parseInt(e.target.dataset.id);
        accionCarrito = accionCarrito.filter(item => item.id !== idToRemove);
        updateCartShopping();

        Toastify({
          text: "🗑️ Producto eliminado",
          duration: 2000,
          gravity: "bottom",
          position: "right",
          backgroundColor: "#00ff7f",
          style: {
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: "bold",
          },
        }).showToast();
      };
    }
  }

  function updateCartShopping() {
    localStorage.setItem("accionCarrito", JSON.stringify(accionCarrito));
    renderCartShopping();
  }

  renderCartShopping();

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      const totalProductos = accionCarrito.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrecio = accionCarrito.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
      const productos = accionCarrito.map(item => item.title).join(', ');
      const datosGuardados = JSON.parse(localStorage.getItem("datosUsuario")) || {};

      Swal.fire({
        title: 'Confirmá tu compra',
        html: `
          <div class="text-start" style="font-family: 'Orbitron', sans-serif;">
            <p><strong>Resumen de tu compra:</strong></p>
            <ul style="margin-left: 1em;">
              <li>🎮 <strong>Productos:</strong> ${totalProductos}</li>
              <li>💵 <strong>Total:</strong> $${totalPrecio}</li>
              <li>📦 <strong>Artículos:</strong> ${productos}</li>
            </ul>
            <hr class="my-2">
            <p><strong>Completá tus datos:</strong></p>
            <input type="text" id="nombreInput" class="swal2-input" placeholder="Tu nombre gamer">
            <input type="email" id="emailInput" class="swal2-input" placeholder="email@example.com">
            <input type="text" id="direccionInput" class="swal2-input" placeholder="Dirección de envío">
            <input type="text" id="tarjetaInput" class="swal2-input" placeholder="Tarjeta (XXXX XXXX XXXX XXXX)" maxlength="19">
          </div>
        `,
        icon: 'info',
        background: '#111',
        color: '#00ff7f',
        showCancelButton: true,
        confirmButtonColor: '#00ff7f',
        cancelButtonColor: '#ff4444',
        confirmButtonText: '✅ Comprar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.querySelector('#nombreInput').value = datosGuardados.nombre || '';
          popup.querySelector('#emailInput').value = datosGuardados.email || '';
          popup.querySelector('#direccionInput').value = datosGuardados.direccion || '';
          popup.querySelector('#tarjetaInput').value = datosGuardados.tarjeta || '';
          popup.querySelector('#tarjetaInput').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '').substring(0, 16);
            e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
          });
        },
        preConfirm: () => {
          const nombre = document.getElementById("nombreInput").value.trim();
          const email = document.getElementById("emailInput").value.trim();
          const direccion = document.getElementById("direccionInput").value.trim();
          const tarjeta = document.getElementById("tarjetaInput").value.trim();

          if (!nombre || !email || !direccion || !tarjeta) {
            Swal.showValidationMessage("⚠️ Completá todos los campos");
            return false;
          }

          localStorage.setItem("datosUsuario", JSON.stringify({ nombre, email, direccion, tarjeta }));
          return { nombre, email, direccion, tarjeta };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("accionCarrito");
          accionCarrito = [];
          renderCartShopping();
          Swal.fire({
            title: "¡Gracias por tu compra! 🕹️",
            text: "Te enviamos el detalle por correo 📩",
            icon: "success",
            background: "#111",
            color: "#00ff7f",
            confirmButtonColor: "#00ff7f"
          });
        }
      });
    });
  }
});