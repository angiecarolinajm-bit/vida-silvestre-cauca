
const botonMenu = document.querySelector("#menuBoton");
const menuNavegacion = document.querySelector("#menu");

// Menú para celulares
if (botonMenu && menuNavegacion) {
  botonMenu.addEventListener("click", () => {
    const abierto = menuNavegacion.classList.toggle("abierto");

    botonMenu.setAttribute("aria-expanded", String(abierto));
    botonMenu.setAttribute(
      "aria-label",
      abierto ? "Cerrar menú" : "Abrir menú"
    );
    botonMenu.textContent = abierto ? "✕" : "☰";
  });

  menuNavegacion.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      menuNavegacion.classList.remove("abierto");
      botonMenu.setAttribute("aria-expanded", "false");
      botonMenu.setAttribute("aria-label", "Abrir menú");
      botonMenu.textContent = "☰";
    });
  });
}

// Activar y actualizar el modo sin conexión
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registro = await navigator.serviceWorker.register(
        "./service-worker.js",
        { updateViaCache: "none" }
      );

      await registro.update();

      console.log("Modo sin conexión registrado y actualizado.");
    } catch (error) {
      console.error("No se pudo activar el modo sin conexión:", error);
    }
  });
}
