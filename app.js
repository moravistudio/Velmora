/* Velmora: JavaScript simple del sitio (sin dependencias)
   1. Formulario de encargo (Contacto): envío simulado.
   2. Catálogo de Productos: filtros por categoría y buscador.
   3. Carrito lateral + pedido con pago SIMULADO (no se cobra ni se envía nada).
      El carrito se guarda en el navegador y funciona en las 4 páginas.
   Adaptado del modelo de Merengue (tienda.js). */

/* ---------- 1. Formulario de encargo (Contacto) ---------- */
(function () {
  var form = document.getElementById('form-encargo');
  var ok = document.getElementById('encargo-ok');
  if (!form || !ok) return;

  /* Fecha del encargo: desde mañana y sin domingos (atendemos de lunes a sábado). */
  var campoFecha = document.getElementById('fecha');
  if (campoFecha) {
    var manana = new Date(); manana.setDate(manana.getDate() + 1);
    campoFecha.min = manana.getFullYear() + '-' + ('0' + (manana.getMonth() + 1)).slice(-2) + '-' + ('0' + manana.getDate()).slice(-2);
    campoFecha.addEventListener('change', function () {
      var p = campoFecha.value.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
      campoFecha.setCustomValidity(p.length === 3 && d.getDay() === 0 ? 'Atendemos de lunes a sábado. Elige otro día.' : '');
      if (campoFecha.validationMessage) campoFecha.reportValidity();
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('ok-nombre').textContent = form.nombre.value.trim().split(' ')[0];
    document.getElementById('ok-whatsapp').textContent = form.whatsapp.value.trim();
    form.hidden = true;
    ok.hidden = false;
    ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('otro-encargo').addEventListener('click', function () {
    form.reset();
    ok.hidden = true;
    form.hidden = false;
    form.nombre.focus();
  });
})();

/* ---------- 2 y 3. Productos, carrito y pedido ---------- */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* SITIO: dirección pública del sitio. Los enlaces de producto (producto/ID.html) llevan la foto y el nombre a la vista previa de WhatsApp. Cambiar al publicar si la dirección es otra. */
  var ENVIO = 8, GRATIS_DESDE = 150, WHATSAPP = '51999999999', LLAVE = 'velmora-carrito', SITIO = 'https://moravistudio.github.io/Velmora/';
  function enlaceProducto(id) { return SITIO + 'producto/' + id + '.html'; }

  var CATEGORIAS = [
    { id: 'tortas', num: '01', nombre: 'Tortas', cursiva: false, clase: 'salvia', desc: 'Enteras, para compartir. De 8 a 30 porciones.' },
    { id: 'tartas', num: '02', nombre: 'Tartas y pies', cursiva: true, clase: 'marfil', desc: 'Limón, manzana, frutas de estación.' },
    { id: 'postres', num: '03', nombre: 'Postres', cursiva: false, clase: 'mantequilla', desc: 'Porciones para el antojo de hoy.' },
    { id: 'bocaditos', num: '04', nombre: 'Bocaditos', cursiva: true, clase: 'verde', desc: 'Por caja o por ciento, para reuniones y eventos.' }
  ];

  /* tam = [etiqueta, precio]. La foto de cada producto es img/producto-ID.jpg (4:5). */
  var TORTA = function (a, b, c) { return [['8 porciones', a], ['16 porciones', b], ['24 porciones', c]]; };
  var PRODUCTOS = [
    { id: 'chocolate-fudge', cat: 'tortas', nombre: 'Chocolate fudge', detalle: 'Bizcocho de cacao y ganache. De 8 a 24 porciones.', tam: TORTA(75, 130, 180) },
    { id: 'tres-leches', cat: 'tortas', nombre: 'Tres leches', detalle: 'Bizcocho bañado en tres leches y crema. De 8 a 24 porciones.', tam: TORTA(60, 105, 150) },
    { id: 'selva-negra', cat: 'tortas', nombre: 'Selva negra', detalle: 'Chocolate, cerezas y crema. De 8 a 24 porciones.', tam: TORTA(78, 135, 190) },
    { id: 'zanahoria-nueces', cat: 'tortas', nombre: 'Zanahoria y nueces', detalle: 'Con frosting de queso crema. De 8 a 24 porciones.', tam: TORTA(68, 118, 165) },

    { id: 'pie-limon', cat: 'tartas', nombre: 'Pie de limón', detalle: 'Por porción o entero (8 porciones).', tam: [['Porción', 9], ['Entero', 58]] },
    { id: 'tarta-manzana', cat: 'tartas', nombre: 'Tarta de manzana', detalle: 'Por porción o entera (8 porciones).', tam: [['Porción', 8], ['Entera', 55]] },
    { id: 'tartaleta-frutas', cat: 'tartas', nombre: 'Tartaleta de frutas', detalle: 'Frutas de estación. Por porción o entera.', tam: [['Porción', 10], ['Entera', 62]] },
    { id: 'tarta-frutos-rojos', cat: 'tartas', nombre: 'Tarta de frutos rojos', detalle: 'Por porción o entera (8 porciones).', tam: [['Porción', 10], ['Entera', 64]] },

    { id: 'cheesecake-fresa', cat: 'postres', nombre: 'Cheesecake de fresa', detalle: 'Porción individual.', tam: [['Porción', 11]] },
    { id: 'tiramisu', cat: 'postres', nombre: 'Tiramisú', detalle: 'Porción individual.', tam: [['Porción', 12]] },
    { id: 'brownie-chocolate', cat: 'postres', nombre: 'Brownie de chocolate', detalle: 'Porción individual.', tam: [['Porción', 8]] },
    { id: 'suspiro-limena', cat: 'postres', nombre: 'Suspiro a la limeña', detalle: 'Porción individual.', tam: [['Porción', 9]] },

    { id: 'alfajores', cat: 'bocaditos', nombre: 'Alfajores', detalle: 'Rellenos de manjar blanco. Caja de 12.', tam: [['Caja x12', 32]] },
    { id: 'ciento-bocaditos', cat: 'bocaditos', nombre: 'Ciento de bocaditos', detalle: 'Surtido para reuniones y eventos.', tam: [['Ciento', 95]] },
    { id: 'cupcakes', cat: 'bocaditos', nombre: 'Cupcakes', detalle: 'Sabores surtidos del día. Caja de 6.', tam: [['Caja x6', 36]] },
    { id: 'mini-tartaletas', cat: 'bocaditos', nombre: 'Mini tartaletas', detalle: 'Frutas y crema pastelera. Caja de 12.', tam: [['Caja x12', 40]] }
  ];

  /* Ficha de cada producto: descripción, ingredientes y (si hace falta) días de anticipación. */
  var FICHA = {
    'chocolate-fudge': ['Tres capas de bizcocho húmedo de cacao, rellenas y cubiertas con ganache de chocolate semiamargo. Se decora con virutas de chocolate y una frambuesa fresca.', ['Chocolate semiamargo', 'Cacao', 'Mantequilla', 'Huevos', 'Frambuesa']],
    'tres-leches': ['Bizcocho de vainilla bañado en tres leches y cubierto con crema chantilly y un toque de canela. Húmedo, suave y nada empalagoso.', ['Leche evaporada', 'Leche condensada', 'Crema de leche', 'Vainilla', 'Canela']],
    'selva-negra': ['Capas de bizcocho de chocolate con crema chantilly y cerezas en almíbar, cubierta con virutas de chocolate y cerezas frescas.', ['Chocolate', 'Cerezas', 'Crema chantilly', 'Almíbar de cereza', 'Huevos']],
    'zanahoria-nueces': ['Bizcocho especiado con zanahoria rallada y nueces, con frosting de queso crema, nueces troceadas y un hilo de caramelo.', ['Zanahoria', 'Nueces', 'Queso crema', 'Canela', 'Caramelo']],
    'pie-limon': ['Masa quebrada crujiente, relleno cremoso de limón y merengue dorado al soplete. Ácido, dulce y ligero.', ['Limón', 'Mantequilla', 'Huevos', 'Merengue', 'Harina']],
    'tarta-manzana': ['Masa quebrada con manzanas en láminas finas, canela y un glaseado brillante. Se sirve mejor tibia.', ['Manzana', 'Canela', 'Mantequilla', 'Azúcar moreno', 'Harina']],
    'tartaleta-frutas': ['Base de masa sablée con crema pastelera y frutas de estación, terminada con un glaseado brillante.', ['Frutas de estación', 'Crema pastelera', 'Masa sablée', 'Mantequilla', 'Vainilla']],
    'tarta-frutos-rojos': ['Masa quebrada rellena de crema suave y cubierta con frambuesas, fresas y moras frescas.', ['Frambuesa', 'Fresa', 'Mora', 'Crema pastelera', 'Mantequilla']],
    'cheesecake-fresa': ['Cremoso de queso sobre base de galleta, con salsa de fresa y una fresa fresca encima.', ['Queso crema', 'Galleta', 'Fresa', 'Crema de leche', 'Vainilla']],
    'tiramisu': ['Soletillas bañadas en café con crema de mascarpone y cacao por encima. Se sirve frío.', ['Mascarpone', 'Café', 'Soletillas', 'Huevos', 'Cacao']],
    'brownie-chocolate': ['Brownie denso y húmedo de chocolate, con borde crocante y azúcar glas.', ['Chocolate semiamargo', 'Mantequilla', 'Huevos', 'Cacao', 'Azúcar']],
    'suspiro-limena': ['Manjar blanco suave coronado con merengue al oporto y canela. El clásico limeño.', ['Manjar blanco', 'Yemas', 'Merengue', 'Oporto', 'Canela']],
    'alfajores': ['Galletas de maicena que se deshacen en la boca, rellenas de manjar blanco y pasadas por azúcar glas. Caja de 12.', ['Maicena', 'Manjar blanco', 'Mantequilla', 'Azúcar glas', 'Harina']],
    'ciento-bocaditos': ['Surtido de bocaditos dulces para reuniones y eventos: tartaletas, alfajores y trufas. Se piden con 2 días de anticipación.', ['Tartaletas', 'Alfajores', 'Trufas', 'Crema pastelera', 'Manjar blanco']],
    'cupcakes': ['Cupcakes de vainilla y de chocolate con crema de mantequilla, en sabores surtidos del día. Caja de 6.', ['Vainilla', 'Chocolate', 'Mantequilla', 'Huevos', 'Crema de mantequilla']],
    'mini-tartaletas': ['Mini tartaletas de masa quebrada con crema pastelera y frutas frescas. Caja de 12.', ['Masa quebrada', 'Crema pastelera', 'Frutas frescas', 'Mantequilla', 'Vainilla']]
  };
  PRODUCTOS.forEach(function (p) { var f = FICHA[p.id]; p.desc = f[0]; p.ing = f[1]; if (p.id === 'ciento-bocaditos') p.dias = 2; });

  /* ---------- utilidades ---------- */
  function prod(id) { return PRODUCTOS.filter(function (p) { return p.id === id; })[0]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dinero(n) { return 'S/ ' + Number(n).toLocaleString('es-PE', { maximumFractionDigits: 2 }); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function leer(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function escribir(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: vive solo mientras la página está abierta */ } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function etiquetaFecha(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }); }
  /* Tortas: desde mañana. El resto: hoy si se pide antes de las 12:00 (como dice el sitio), si no mañana. */
  /* La pastelería atiende de lunes a sábado: los domingos no se ofrecen como fecha. */
  function fechaMinima(p) { var d = new Date(); if (p.dias) d.setDate(d.getDate() + p.dias); else if (p.cat === 'tortas' || d.getHours() >= 12) d.setDate(d.getDate() + 1); if (d.getDay() === 0) d.setDate(d.getDate() + 1); return iso(d); }
  function opcionesFecha(p) {
    var base = new Date(), min = fechaMinima(p), out = [];
    for (var i = 0; i < 20 && out.length < 8; i++) { var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i); if (d.getDay() !== 0 && iso(d) >= min) out.push(iso(d)); }
    return out;
  }
  function rotuloFecha(s) {
    var t = new Date(); var d0 = iso(t); t.setDate(t.getDate() + 1);
    return (s === d0 ? 'Hoy · ' : s === iso(t) ? 'Mañana · ' : '') + etiquetaFecha(s);
  }
  function foto(id, clase, etiqueta) {
    return '<span class="foto ' + clase + '">' + (etiqueta ? '<span class="foto__etiqueta">' + esc(etiqueta) + '</span>' : '') +
      '<img src="img/producto-' + id + '.jpg" alt="' + esc(prod(id).nombre) + '" onload="this.parentElement.classList.add(\'con-foto\')" onerror="this.remove()"></span>';
  }

  /* ---------- carrito (se guarda en el navegador) ---------- */
  var hoy = iso(new Date());
  var lineas = (leer(LLAVE, []) || []).filter(function (l) { var p = l && prod(l.i); return p && p.tam[l.t] && l.c > 0 && String(l.f) >= hoy; });
  function llave(l) { return l.i + '|' + l.t + '|' + l.f; }
  function precioUnit(l) { return prod(l.i).tam[l.t][1]; }
  function cantidad() { return lineas.reduce(function (s, l) { return s + l.c; }, 0); }
  function subtotal() { return lineas.reduce(function (s, l) { return s + l.c * precioUnit(l); }, 0); }
  function guardar() { escribir(LLAVE, lineas); pintarCarrito(); }
  function agregar(n) {
    var ex = lineas.filter(function (l) { return llave(l) === llave(n); })[0];
    if (ex) ex.c = Math.min(9, ex.c + n.c); else lineas.push(n);
    guardar();
  }
  function cambiar(k, d) { lineas.forEach(function (l) { if (llave(l) === k) l.c = Math.max(0, Math.min(9, l.c + d)); }); lineas = lineas.filter(function (l) { return l.c > 0; }); guardar(); }
  function quitar(k) { lineas = lineas.filter(function (l) { return llave(l) !== k; }); guardar(); }
  function detalleLinea(l) { return prod(l.i).tam[l.t][0]; }
  function mensajeUno(l) {
    var t = 'Hola Velmora, quiero pedir:\n• ' + prod(l.i).nombre + ' (' + detalleLinea(l) + ') x' + l.c + ', para el ' + etiquetaFecha(l.f) + ' - ' + dinero(l.c * precioUnit(l)) +
      '\n' + enlaceProducto(l.i) + '\n¿Me confirman disponibilidad y la entrega?';
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t);
  }
  function mensajeWa() {
    var t = 'Hola Velmora, quiero hacer este pedido:\n' + lineas.map(function (l) {
      return '• ' + prod(l.i).nombre + ' (' + detalleLinea(l) + ') x' + l.c + ', para el ' + etiquetaFecha(l.f) + ' - ' + dinero(l.c * precioUnit(l)) + '\n  ' + enlaceProducto(l.i);
    }).join('\n') + '\nSubtotal: ' + dinero(subtotal()) + '. ¿Me confirman disponibilidad y la entrega?';
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t);
  }

  /* ---------- carrito lateral ---------- */
  var velo = document.createElement('div'); velo.className = 'velo';
  var cajon = document.createElement('aside'); cajon.className = 'cajon'; cajon.setAttribute('aria-label', 'Carrito de compras'); cajon.setAttribute('aria-hidden', 'true');
  cajon.innerHTML = '<div class="cajon__cab"><h3>Tu carrito</h3><button class="cajon__x" type="button" id="cerrar-carrito" aria-label="Cerrar carrito">×</button></div><div class="cajon__lista" id="lista-carrito"></div><div class="cajon__pie" id="pie-carrito"></div>';
  document.body.appendChild(velo); document.body.appendChild(cajon);

  function abrirCarrito() { velo.classList.add('on'); cajon.classList.add('on'); cajon.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('#cerrar-carrito').focus(); }
  function cerrarCarrito() { velo.classList.remove('on'); cajon.classList.remove('on'); cajon.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  function irACatalogo() { if ($('#catalogo')) { var c = $('#catalogo'); c.scrollIntoView({ behavior: 'smooth' }); } else location.href = 'productos.html'; }

  function pintarCarrito() {
    var n = cantidad();
    $$('.boton-carrito__num').forEach(function (e) { e.textContent = '(' + n + ')'; });
    var lista = $('#lista-carrito'), pie = $('#pie-carrito');
    if (!lineas.length) {
      lista.innerHTML = '<div class="cajon__vacio"><p class="cajon__vacio-titulo">Tu carrito está <em>vacío.</em></p><p class="nota">Elige un producto, su tamaño y para cuándo lo quieres.</p></div>';
      pie.innerHTML = '<button class="boton boton--verde" type="button" id="seguir">Ver productos <span aria-hidden="true">→</span></button>';
      return;
    }
    lista.innerHTML = lineas.map(function (l) {
      var k = esc(llave(l)), p = prod(l.i);
      return '<div class="linea">' + foto(l.i, 'linea__foto') + '<div><div class="linea__nombre">' + esc(p.nombre) + '</div><div class="linea__var">' + esc(detalleLinea(l)) + '</div><div class="linea__fecha">Para el ' + esc(etiquetaFecha(l.f)) + '</div>' +
        '<div class="cant"><button type="button" data-acc="menos" data-k="' + k + '" aria-label="Quitar una">−</button><span>' + l.c + '</span><button type="button" data-acc="mas" data-k="' + k + '" aria-label="Agregar una">+</button></div></div>' +
        '<div class="linea__lado"><div class="linea__precio">' + dinero(l.c * precioUnit(l)) + '</div><button class="linea__quitar" type="button" data-acc="quitar" data-k="' + k + '">Quitar</button></div></div>';
    }).join('');
    pie.innerHTML = '<div class="sub"><span>Subtotal</span><strong>' + dinero(subtotal()) + '</strong></div><p class="nota">El delivery se calcula al hacer el pedido.</p>' +
      '<button class="boton boton--verde" type="button" id="ir-pedido">Hacer mi pedido <span aria-hidden="true">→</span></button>' +
      '<a class="enlace-subrayado" href="' + mensajeWa() + '" target="_blank" rel="noopener">Enviar este pedido por WhatsApp</a>';
  }
  cajon.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acc]');
    if (b) { var k = b.getAttribute('data-k'), a = b.getAttribute('data-acc'); if (a === 'mas') cambiar(k, 1); else if (a === 'menos') cambiar(k, -1); else quitar(k); return; }
    if (e.target.closest('#seguir')) { cerrarCarrito(); irACatalogo(); return; }
    if (e.target.closest('#ir-pedido')) { cerrarCarrito(); abrirPedido(); }
  });
  velo.addEventListener('click', cerrarCarrito);
  $('#cerrar-carrito').addEventListener('click', cerrarCarrito);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cajon.classList.contains('on')) cerrarCarrito(); });
  $$('.boton-carrito').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); abrirCarrito(); }); });

  /* ---------- lupa del header: buscador de productos en cualquier página ---------- */
  /* En Productos lleva al buscador de la página; en las demás abre una ventana de búsqueda con resultados al escribir. */
  var dlgBuscar = document.createElement('dialog'); dlgBuscar.className = 'buscar-pop'; dlgBuscar.setAttribute('aria-label', 'Buscar un producto');
  dlgBuscar.innerHTML = '<div class="buscar-pop__caja"><div class="buscar-pop__fila"><label class="buscador buscar-pop__campo"><span class="sr-only">Buscar un producto</span>' +
    '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#183D32" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
    '<input id="buscar-rapido" type="search" placeholder="Buscar un producto" autocomplete="off"></label>' +
    '<button class="cajon__x" type="button" data-x aria-label="Cerrar">×</button></div><ul class="buscar-pop__lista" id="buscar-lista"></ul></div>';
  document.body.appendChild(dlgBuscar);
  function resultadosBusqueda(q) {
    q = norm(q.trim());
    if (!q) return [];
    return PRODUCTOS.filter(function (p) { return norm(p.nombre + ' ' + p.detalle + ' ' + p.ing.join(' ') + ' ' + p.cat).indexOf(q) > -1; }).slice(0, 6);
  }
  function pintarBusqueda() {
    var q = $('#buscar-rapido').value, res = resultadosBusqueda(q), lista = $('#buscar-lista');
    if (!q.trim()) { lista.innerHTML = '<li class="buscar-pop__vacio">Prueba con «limón», «chocolate» o «tres leches».</li>'; return; }
    lista.innerHTML = res.length ? res.map(function (p) {
      return '<li><button class="buscar-res" type="button" data-id="' + p.id + '"><img src="img/producto-' + p.id + '.jpg" alt="" onerror="this.remove()"><span><strong>' + esc(p.nombre) + '</strong><small>' +
        esc(NOMBRE_CAT[p.cat]) + ' · ' + (p.tam.length > 1 ? 'Desde ' : '') + dinero(p.tam[0][1]) + '</small></span></button></li>';
    }).join('') : '<li class="buscar-pop__vacio">No encontramos ese producto. <a href="productos.html">Ver todos los productos</a></li>';
  }
  function irAProducto(id) {
    dlgBuscar.close();
    if ($('#catalogo')) abrirAgregar(id); else location.href = 'productos.html#' + id;
  }
  $$('.boton-buscar').forEach(function (b) {
    b.addEventListener('click', function () {
      var campo = $('#buscar');
      if (campo) { campo.scrollIntoView({ behavior: 'smooth', block: 'center' }); campo.focus(); return; }
      $('#buscar-rapido').value = ''; pintarBusqueda(); dlgBuscar.showModal(); $('#buscar-rapido').focus();
    });
  });
  dlgBuscar.addEventListener('input', pintarBusqueda);
  dlgBuscar.addEventListener('click', function (e) {
    if (e.target === dlgBuscar || e.target.closest('[data-x]')) { dlgBuscar.close(); return; }
    var r = e.target.closest('[data-id]'); if (r) irAProducto(r.getAttribute('data-id'));
  });
  dlgBuscar.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var primero = resultadosBusqueda($('#buscar-rapido').value)[0]; if (primero) { e.preventDefault(); irAProducto(primero.id); }
  });

  /* ---------- agregar: tamaño, cantidad y fecha ---------- */
  var dlgAgregar = document.createElement('dialog'); dlgAgregar.className = 'ficha'; dlgAgregar.setAttribute('aria-label', 'Elegir y agregar al carrito');
  dlgAgregar.innerHTML = '<div class="ficha__caja" id="agregar-raiz"></div>';
  document.body.appendChild(dlgAgregar);
  var A = null;
  var NOMBRE_CAT = { tortas: 'Tortas', tartas: 'Tartas y pies', postres: 'Postres', bocaditos: 'Bocaditos' };

  function pintarAgregar() {
    var p = A.p, u = p.tam[A.t][1], min = fechaMinima(p), fechas = opcionesFecha(p);
    var aviso = (p.dias ? 'Este producto se pide con ' + p.dias + ' días de anticipación.' : p.cat === 'tortas' ? 'Las tortas se piden con 1 día de anticipación.' : 'Pídelo antes de las 12:00 para recibirlo hoy.') + ' Atendemos de lunes a sábado.';
    $('#agregar-raiz').innerHTML =
      '<div class="ficha__visual ficha__visual--' + p.cat + '">' + foto(p.id, 'foto--arco ficha__foto', 'Foto · ' + p.nombre + ' · 4:5') + '</div>' +
      '<div class="ficha__info"><button class="cajon__x ficha__cerrar" type="button" data-x aria-label="Cerrar">×</button>' +
      '<span class="etiqueta-linea">' + esc(NOMBRE_CAT[p.cat]) + '</span><h2 class="modal__titulo">' + esc(p.nombre) + '</h2>' +
      '<p class="ficha__desc">' + esc(p.desc) + '</p>' +
      '<div class="campo"><span class="campo__rotulo">Ingredientes</span><ul class="ficha__ing">' + p.ing.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="campo"><span class="campo__rotulo">Tamaño</span><div class="pastillas">' + p.tam.map(function (t, i) {
        return '<button class="pastilla" type="button" aria-pressed="' + (i === A.t) + '" data-t="' + i + '">' + esc(t[0]) + ' · ' + dinero(t[1]) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="campo"><span class="campo__rotulo">Cantidad</span><div class="cant cant--grande"><button type="button" data-q="-1" aria-label="Menos">−</button><span>' + A.c + '</span><button type="button" data-q="1" aria-label="Más">+</button></div></div>' +
      '<div class="campo"><span class="campo__rotulo">Para cuándo</span><div class="pastillas">' + fechas.map(function (f) {
        return '<button class="pastilla" type="button" aria-pressed="' + (f === A.f) + '" data-f="' + f + '">' + esc(rotuloFecha(f)) + '</button>';
      }).join('') + '</div>' +
      '<p class="nota">' + aviso + ' ¿Para otra fecha? <a href="contacto.html">Haz un encargo</a>.</p></div>' +
      '<div class="ficha__compra"><div class="modal__total"><span>Total</span><strong>' + dinero(u * A.c) + '</strong></div>' +
      '<div class="ficha__acciones"><button class="boton boton--verde" type="button" data-ok>Agregar al carrito <span aria-hidden="true">→</span></button>' +
      '<a class="boton boton--contorno ficha__wa" target="_blank" rel="noopener" href="' + mensajeUno({ i: p.id, t: A.t, c: A.c, f: A.f }) + '">Pedirlo por WhatsApp</a></div></div></div>';
  }
  function abrirAgregar(id) { var p = prod(id); A = { p: p, t: 0, c: 1, f: fechaMinima(p) }; pintarAgregar(); dlgAgregar.showModal(); dlgAgregar.scrollTop = 0; }
  dlgAgregar.addEventListener('click', function (e) {
    if (e.target.closest('[data-x]')) { dlgAgregar.close(); return; }
    var t = e.target.closest('[data-t]'); if (t) { A.t = +t.getAttribute('data-t'); pintarAgregar(); return; }
    var q = e.target.closest('[data-q]'); if (q) { A.c = Math.max(1, Math.min(9, A.c + +q.getAttribute('data-q'))); pintarAgregar(); return; }
    var f = e.target.closest('[data-f]'); if (f) { A.f = f.getAttribute('data-f'); pintarAgregar(); return; }
    if (e.target.closest('[data-ok]')) {
      agregar({ i: A.p.id, t: A.t, c: A.c, f: A.f });
      dlgAgregar.close(); abrirCarrito();
    }
  });

  /* ---------- pedido (pago simulado) ---------- */
  var dlgPedido = document.createElement('dialog'); dlgPedido.className = 'modal modal--ancho'; dlgPedido.setAttribute('aria-label', 'Hacer pedido');
  dlgPedido.innerHTML = '<div class="modal__caja" id="pedido-raiz"></div>';
  document.body.appendChild(dlgPedido);
  var P = { entrega: 'recojo', medio: 'tarjeta' };

  function envio() { return P.entrega === 'delivery' && subtotal() < GRATIS_DESDE ? ENVIO : 0; }
  function camposPago() {
    if (P.medio === 'tarjeta') return '<div class="formulario__fila"><div class="campo"><label for="tn">Número de tarjeta</label><input id="tn" inputmode="numeric" placeholder="4111 1111 1111 1111" autocomplete="off"></div><div class="formulario__fila"><div class="campo"><label for="tv">Vence</label><input id="tv" placeholder="MM/AA" autocomplete="off"></div><div class="campo"><label for="tc">CVV</label><input id="tc" inputmode="numeric" placeholder="123" autocomplete="off"></div></div></div>';
    if (P.medio === 'yape') return '<div class="formulario__fila"><div class="campo"><label for="yc">Celular de tu Yape</label><input id="yc" inputmode="numeric" placeholder="9XX XXX XXX"></div><div class="campo"><label for="yk">Código de aprobación</label><input id="yk" inputmode="numeric" placeholder="6 dígitos de tu app"></div></div>';
    return '<p class="nota">Al pagar con Plin te mostraremos la ventana de tu banco para aprobar el pago desde tu app.</p>';
  }
  function camposEntrega() {
    return P.entrega === 'delivery'
      ? '<div class="formulario__fila"><div class="campo"><label for="pdi">Distrito</label><input id="pdi" autocomplete="address-level2"></div><div class="campo"><label for="pdr">Dirección y referencia</label><input id="pdr" autocomplete="street-address"></div></div>'
      : '<p class="nota">Recoges tu pedido en la tienda (Av. Larco 123, Miraflores), en la fecha que elegiste. Sin costo.</p>';
  }
  function opcionesPastilla(attr, lista, actual) {
    return '<div class="pastillas">' + lista.map(function (m) { return '<button class="pastilla" type="button" aria-pressed="' + (m[0] === actual) + '" data-' + attr + '="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>';
  }
  function totales() {
    var sub = subtotal(), env = envio();
    $('#pedido-totales').innerHTML = '<div class="fila-total"><span>Subtotal</span><span>' + dinero(sub) + '</span></div><div class="fila-total"><span>' + (P.entrega === 'delivery' ? 'Delivery' : 'Recojo en tienda') + '</span><span>' + (env ? dinero(env) : 'Gratis') + '</span></div><div class="fila-total fila-total--grande"><span>Total</span><span>' + dinero(sub + env) + '</span></div>';
    $('#pagar').innerHTML = 'Pagar ' + dinero(sub + env) + ' <span aria-hidden="true">→</span>';
  }
  function abrirPedido() {
    if (!lineas.length) { abrirCarrito(); return; }
    P = { entrega: 'recojo', medio: 'tarjeta' };
    $('#pedido-raiz').innerHTML = '<button class="cajon__x modal__cerrar" type="button" data-x aria-label="Cerrar">×</button><div class="pedido"><div class="pedido__form">' +
      '<span class="etiqueta-linea">Tu pedido</span><h2 class="modal__titulo">Finalizar <em>pedido</em></h2>' +
      '<div class="bloque"><h3>1 · Tus datos</h3><div class="formulario__fila"><div class="campo"><label for="pnm">Nombre completo</label><input id="pnm" autocomplete="name"></div><div class="campo"><label for="pce">Celular</label><input id="pce" inputmode="numeric" autocomplete="tel"></div></div><div class="campo"><label for="pco">Correo</label><input id="pco" type="email" autocomplete="email"></div></div>' +
      '<div class="bloque"><h3>2 · Entrega</h3>' + opcionesPastilla('entrega', [['recojo', 'Recojo en tienda · Gratis'], ['delivery', 'Delivery · ' + dinero(ENVIO) + ' (gratis desde ' + dinero(GRATIS_DESDE) + ')']], P.entrega) +
      '<div id="campos-entrega">' + camposEntrega() + '</div><div class="campo"><label for="phr">Horario</label><select id="phr"><option>7:00 a. m. – 11:00 a. m.</option><option>11:00 a. m. – 3:00 p. m.</option><option>3:00 p. m. – 7:00 p. m.</option></select></div></div>' +
      '<div class="bloque"><h3>3 · Medio de pago</h3>' + opcionesPastilla('medio', [['tarjeta', 'Tarjeta'], ['yape', 'Yape'], ['plin', 'Plin']], P.medio) + '<div id="campos-pago">' + camposPago() + '</div></div>' +
      '<p class="nota">Pago simulado para la demostración: no se cobra nada. En la tienda real este paso lo procesa la pasarela de pago y la pastelería recibe el pedido por correo.</p><p class="aviso" id="pedido-err" role="alert"></p></div>' +
      '<aside class="pedido__resumen"><h3>Resumen</h3>' + lineas.map(function (l) {
        return '<div class="linea">' + foto(l.i, 'linea__foto') + '<div><div class="linea__nombre">' + esc(prod(l.i).nombre) + '</div><div class="linea__var">' + esc(detalleLinea(l)) + ' · x' + l.c + '</div><div class="linea__fecha">Para el ' + esc(etiquetaFecha(l.f)) + '</div></div><div class="linea__lado"><div class="linea__precio">' + dinero(l.c * precioUnit(l)) + '</div></div></div>';
      }).join('') + '<div id="pedido-totales"></div><button class="boton boton--verde" type="button" id="pagar"></button><button class="enlace-subrayado" type="button" id="pedido-volver">Volver al carrito</button></aside></div>';
    totales();
    if (!dlgPedido.open) dlgPedido.showModal();
  }
  function marcar(grupo, attr, valor) { $$('[data-' + attr + ']', $('#pedido-raiz')).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-' + attr) === valor); }); }
  dlgPedido.addEventListener('click', function (e) {
    if (e.target === dlgPedido || e.target.closest('[data-x]')) { dlgPedido.close(); return; }
    if (e.target.closest('#pedido-volver')) { dlgPedido.close(); abrirCarrito(); return; }
    var en = e.target.closest('[data-entrega]');
    if (en) { P.entrega = en.getAttribute('data-entrega'); marcar(null, 'entrega', P.entrega); $('#campos-entrega').innerHTML = camposEntrega(); totales(); return; }
    var me = e.target.closest('[data-medio]');
    if (me) { P.medio = me.getAttribute('data-medio'); marcar(null, 'medio', P.medio); $('#campos-pago').innerHTML = camposPago(); return; }
    if (e.target.closest('#pagar')) pagar();
    if (e.target.closest('#pedido-listo')) { dlgPedido.close(); irACatalogo(); }
  });
  function pagar() {
    var ids = ['pnm', 'pce', 'pco'].concat(P.entrega === 'delivery' ? ['pdi', 'pdr'] : []);
    var ok = ids.map(function (id) { var c = $('#' + id), v = c.value.trim(); c.classList.toggle('invalido', !v); return v; }).every(Boolean);
    if (ok && !/^\S+@\S+\.\S+$/.test($('#pco').value.trim())) { $('#pco').classList.add('invalido'); ok = false; }
    if (!ok) { $('#pedido-err').textContent = 'Completa tus datos y la dirección de entrega para continuar.'; return; }
    var n = 'VE-' + String(Math.floor(1000 + Math.random() * 8999)), nombre = $('#pnm').value.trim().split(' ')[0], total = subtotal() + envio(), entrega = P.entrega, horario = $('#phr').value;
    var det = lineas.map(function (l) { return '<li><span>' + esc(prod(l.i).nombre) + ' · ' + esc(detalleLinea(l)) + ' x' + l.c + '</span><small>Para el ' + esc(etiquetaFecha(l.f)) + '</small></li>'; }).join('');
    lineas = []; guardar();
    $('#pedido-raiz').innerHTML = '<button class="cajon__x modal__cerrar" type="button" data-x aria-label="Cerrar">×</button><div class="gracias"><p class="formulario__ok-titulo">¡Gracias, <em>' + esc(nombre) + '!</em></p>' +
      '<p class="formulario__ok-texto">Tu pedido <strong>' + n + '</strong> fue recibido. Te escribiremos al correo y al celular que indicaste para confirmar los detalles.</p>' +
      '<ul class="gracias__lista">' + det + '</ul><p class="formulario__ok-texto">' + (entrega === 'delivery' ? 'Delivery' : 'Recojo en tienda') + ' · ' + esc(horario) + ' · Total ' + dinero(total) + '</p>' +
      '<p class="nota">Esto fue una simulación. En la tienda real el pago se procesa con la pasarela y la pastelería recibe un correo con este pedido para prepararlo.</p>' +
      '<button class="boton boton--verde" type="button" id="pedido-listo">Seguir viendo productos <span aria-hidden="true">→</span></button></div>';
  }

  /* ---------- catálogo (solo en productos.html) ---------- */
  var catalogo = $('#catalogo');
  if (catalogo) {
    var tarjeta = function (p) {
      return '<article class="tarjeta" data-texto="' + esc(norm(p.nombre + ' ' + p.detalle)) + '">' + foto(p.id, 'tarjeta__foto', 'Foto · ' + p.nombre + ' · 4:5') +
        '<h3 class="tarjeta__nombre">' + esc(p.nombre) + '</h3><span class="tarjeta__detalle">' + esc(p.detalle) + '</span>' +
        '<div class="tarjeta__pie"><span class="tarjeta__precio">' + (p.tam.length > 1 ? 'Desde ' : '') + dinero(p.tam[0][1]) + '</span>' +
        '<button class="boton boton--verde boton--chico" type="button" data-agregar="' + p.id + '">Agregar al carrito</button></div></article>';
    };
    catalogo.innerHTML = CATEGORIAS.map(function (c) {
      return '<section class="grupo grupo--' + c.clase + '" id="' + c.id + '" data-cat="' + c.id + '"><div class="contenedor grupo__inner"><header class="grupo__cab"><span class="categoria__num">' + c.num + '</span>' +
        '<h2 class="categoria__nombre' + (c.cursiva ? ' categoria__nombre--cursiva' : '') + '">' + c.nombre + '</h2><p class="grupo__desc">' + c.desc + '</p></header>' +
        '<div class="grilla">' + PRODUCTOS.filter(function (p) { return p.cat === c.id; }).map(tarjeta).join('') + '</div></div></section>';
    }).join('');

    var estado = { cat: 'todos', q: '' };
    var filtrar = function () {
      var q = norm(estado.q.trim()), total = 0;
      $$('.grupo', catalogo).forEach(function (g) {
        var n = 0;
        $$('.tarjeta', g).forEach(function (t) { var ok = !q || t.getAttribute('data-texto').indexOf(q) > -1; t.hidden = !ok; if (ok) n++; });
        var ver = n > 0 && (estado.cat === 'todos' || estado.cat === g.getAttribute('data-cat'));
        g.hidden = !ver; if (ver) total += n;
      });
      $('#cuenta-productos').textContent = total + (total === 1 ? ' producto' : ' productos');
      $('#sin-resultados').hidden = total > 0;
      $$('[data-cat]', $('#filtros')).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === estado.cat); });
    };
    $('#filtros').addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (!b) return; estado.cat = b.getAttribute('data-cat'); filtrar(); });
    $('#buscar').addEventListener('input', function (e) { estado.q = e.target.value; filtrar(); });
    $('#sin-resultados-limpiar').addEventListener('click', function () { estado = { cat: 'todos', q: '' }; $('#buscar').value = ''; filtrar(); });
    catalogo.addEventListener('click', function (e) {
      var b = e.target.closest('[data-agregar]');
      if (!b && e.target.closest('.tarjeta__foto, .tarjeta__nombre')) b = e.target.closest('.tarjeta').querySelector('[data-agregar]');
      if (b) abrirAgregar(b.getAttribute('data-agregar'));
    });

    var h = location.hash.slice(1);
    if (CATEGORIAS.some(function (c) { return c.id === h; })) estado.cat = h;
    filtrar();
    if (prod(h)) { var pp = prod(h); estado.cat = pp.cat; filtrar(); abrirAgregar(h); }
    if (h === 'buscar') $('#buscar').focus();
    else if (estado.cat !== 'todos') $('#filtros').scrollIntoView();
  }

  pintarCarrito();
})();
