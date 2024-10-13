const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyhm9EJK38TPYO7FlB5OkqznQXbB_sd8Mjs5JxWCMwpgMzagYAv9OEanJtycs92yNli/exec';

let allProducts = [];  // Todos los productos cargados
let filteredProducts = [];  // Productos después del filtrado
let currentPage = 1;
const itemsPerPage = 8;

// Función para cargar los productos desde Google Sheets
async function loadProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        const catalog = document.getElementById('catalog');
        const categorySet = new Set();  // Almacena categorías únicas

        data.forEach((entry) => {
            const product = document.createElement('div');
            product.className = 'product';

            // Extraer datos del Google Sheet
            const nombre = entry["Nombre"];
            const precio = entry["Precio"];
            const categoria = entry["Categoria"];
            const imagenLink = 'images/products/' + entry["Imagen Nombre"];
            categorySet.add(categoria)
            
            product.innerHTML = `
                <img src="${imagenLink}" alt="${nombre}" loading="lazy" onclick="openModal(this.src)">
                <h3 >${nombre}</h3>
                <p>${categoria}</p>
                <p><a href="https://www.mercadolibre.com.ar/jm/search?as_word=${encodeURIComponent(nombre)}" target="_blank">Comparar con ML</a></p>
                <p>Precio: $${precio}</p>
            `;
            product.setAttribute('data-category', categoria);
            
            catalog.appendChild(product);
            allProducts.push(product);  // Almacenar todos los productos
        });

        // Llenar el filtro de categorías
        const categoryFilter = document.getElementById('categoryFilter');
        categorySet.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoryFilter.appendChild(option);
        });

        // Inicializar productos y mostrar la primera página
        filteredProducts = allProducts;  // Inicialmente, todos los productos están filtrados
        showPage(1);
    } catch (error) {
        console.error('Error cargando los productos:', error);
    }
}

// Función para mostrar una página específica
function showPage(pageNumber) {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    document.getElementById('pageNumber').textContent = pageNumber;
    allProducts.forEach(product => product.style.display = 'none');
    filteredProducts.forEach((product, index) => {
        if (index >= (pageNumber - 1) * itemsPerPage && index < pageNumber * itemsPerPage) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });

    // Deshabilitar botones según la página
    document.querySelector('button[onclick="changePage(-1)"]').disabled = pageNumber === 1;
    document.querySelector('button[onclick="changePage(1)"]').disabled = pageNumber === totalPages;
}

// Función para cambiar de página
function changePage(direction) {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage + direction > 0 && currentPage + direction <= totalPages) {
        currentPage += direction;
        showPage(currentPage);
    }
}

// Función para filtrar los productos por categoría
function filterProducts() {
    const selectedCategory = document.getElementById('categoryFilter').value.toLowerCase();

    // Filtrar los productos según la categoría seleccionada
    filteredProducts = allProducts.filter(product => {
        const category = product.getAttribute('data-category').toLowerCase();
        return selectedCategory === 'all' || category === selectedCategory;
    });

    currentPage = 1;  // Reiniciar la paginación al cambiar el filtro
    showPage(currentPage);
}


// Funciones para el modal
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImage.src = imageSrc;
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// Cargar los productos cuando la página esté lista
window.onload = loadProducts;
