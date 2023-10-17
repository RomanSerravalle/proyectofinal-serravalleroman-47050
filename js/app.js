const spanCantidad = document.querySelectorAll(".cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonComprarCarrito = document.querySelector("#btnComprarCarrito");
const filtroCategoria = document.querySelector("#filtroCategoria");

//Clase de productos
class Producto {
  constructor(id, nombre, precio, categoria, imagen, specs) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
    this.specs = specs;
  }
}

//Clase para base de datos del catálogo
class BaseDeDatos {
  constructor() {
    //Array catálogo de productos
    this.productos = [];
    this.cargarProductos();
  }

  async cargarProductos() {
    const response = await fetch("json/productos.json");
    this.productos = await response.json();
    cargarCatalogo(this.productos);
  }

  traerProductos() {
    return this.productos;
  }
  //Devuelve producto por ID
  productoPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  //Devuelve productos por nombre
  productosPorNombre(palabra, categoria) {
    return this.productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(palabra.toLowerCase()) &&
        (categoria === "Todos" || producto.categoria === categoria)
    );
  }
}

//Clase para el carrito
class Carrito {
  constructor() {
    const carritoStorage = JSON.parse(localStorage.getItem("Carrito"));
    //Array del carrito
    this.carrito = carritoStorage || [];
    this.total = 0;
    this.cantidad = 0;
    this.listar();
  }

  //Buscar producto según ID
  enCarrito({ id }) {
    return this.carrito.find((p) => p.id === id);
  }

  //Agregar producto a carrito
  comprar(producto) {
    const productoEnCarrito = this.enCarrito(producto);

    //Condicional para actualizar cantidad del producto
    if (productoEnCarrito) {
      productoEnCarrito.cantidad++;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem("Carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  vaciarCarrito() {
    this.total = 0;
    this.cantidad = 0;
    this.carrito = [];
    localStorage.setItem("Carrito", JSON.stringify(this.carrito));
  }

  //Quitar producto del carrito
  quitar(id) {
    //Buscar nombre del producto
    const productoQuitar = this.carrito.find((producto) => producto.id === id);

    if (productoQuitar) {
      //Buscar índice según ID
      const indice = this.carrito.findIndex((producto) => producto.id === id);
      //Restar cantidad o quitar producto
      this.carrito[indice].cantidad > 1
        ? this.carrito[indice].cantidad--
        : this.carrito.splice(indice, 1);
      localStorage.setItem("Carrito", JSON.stringify(this.carrito));

      Toastify({
        text: `${productoQuitar.nombre} fue quitado del carrito.`,
        className: "productoQuitado",
        duration: 1000,
        position: "center",
      }).showToast();

      this.listar();
    }
  }

  //Mostrar productos en HTML
  listar() {
    this.total = 0;
    this.cantidad = 0;
    divCarrito.innerHTML = "";
    // Mostrar productos en carrito
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `<div class= "productoCarrito">
      <h2>${producto.nombre}</h2>
      <p>$${producto.precio}</p>
      <p>Cantidad: ${producto.cantidad}</p>
      <button class= "btnQuitar"  data-id="${producto.id}">Quitar del carrito</button></div>`;

      this.total += producto.precio * producto.cantidad;
      this.cantidad += producto.cantidad;
    }

    //Display botón Comprar
    if (this.cantidad > 0) {
      botonComprarCarrito.style.display = "block";
    } else {
      botonComprarCarrito.style.display = "none";
    }

    //Asignar evento a botones de quitar
    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        const idProducto = parseInt(boton.dataset.id);
        this.quitar(idProducto);
      });
    }

    //Asignar cantidad a contadores
    spanCantidad.forEach((span) => {
      span.innerHTML = this.cantidad;
    });

    spanTotalCarrito.innerText = this.total;
  }
}

const bDatos = new BaseDeDatos();
const carrito = new Carrito();

cargarCatalogo(bDatos.traerProductos());

//Mostrar catálogo en HTML
function cargarCatalogo(productos) {
  divProductos.innerHTML = "";

  for (const producto of productos) {
    divProductos.innerHTML += `
    <div class="card">
    <h2>${producto.nombre}</h2> 
    <p class="precio">$${producto.precio}</p>
    <p class="categoria">${producto.categoria}</p>
    <div class="imagen">
    <img src="img/${producto.imagen}" alt="${producto.nombre}"/>
    </div>
    <p class="specsProducto">${producto.specs}</p>
    <button class="btnAgregar" data-id="${producto.id}">Agregar al carrito</button>    
    </div>`;
  }

  //Asignar evento a botones de agregar
  const botonesAgregar = document.querySelectorAll(".btnAgregar");

  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      event.preventDefault();
      const idProducto = parseInt(boton.dataset.id);
      const producto = bDatos.productoPorId(idProducto);

      carrito.comprar(producto);

      Toastify({
        text: `Se agregó ${producto.nombre} al carrito.`,
        className: "productoComprado",
        duration: 1000,
        position: "center",
      }).showToast();
    });
  }
}

//Buscador
inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const categoriaSeleccionada = filtroCategoria.value;
  const productosFiltrados = bDatos.productosPorNombre(
    palabra,
    categoriaSeleccionada
  );
  cargarCatalogo(productosFiltrados);
});

botonComprarCarrito.addEventListener("click", (event) => {
  event.preventDefault;
  carrito.vaciarCarrito();
  carrito.listar();

  Swal.fire({
    customClass: "alertComprar",
    position: "center",
    icon: "success",
    title: "¡Gracias por la compra!",
    showConfirmButton: false,
    timer: 1500,
  });
});

// Filtrar productos por categoría
function filtrarProductosPorCategoria(categoria) {
  if (categoria === "Todos") {
    cargarCatalogo(bDatos.traerProductos());
  } else {
    const productosFiltrados = bDatos
      .traerProductos()
      .filter((producto) => producto.categoria === categoria);
    cargarCatalogo(productosFiltrados);
  }
}

// Evento selección de categoría
filtroCategoria.addEventListener("change", () => {
  const categoriaSeleccionada = filtroCategoria.value;
  filtrarProductosPorCategoria(categoriaSeleccionada);
});
