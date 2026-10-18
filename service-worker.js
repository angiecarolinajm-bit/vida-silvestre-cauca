
const CACHE_NAME = "vida-silvestre-v4";

const ARCHIVOS_INICIALES = [
  "./",
  "./index.html",
  "./fauna.html",
  "./flora.html",
  "./conservacion.html",
  "./educacion.html",

  "./detalle-fauna.html",
  "./detalle-flora.html",
  "./detalle-amenazas.html",
  "./detalle-educacion.html",

  "./styles.css",
  "./script.js",
  "./manifest.json",

  // Imágenes principales
  "./imagenes/cauca.jpg",
  "./imagenes/oso.jpg",
  "./imagenes/munchique.jpg",
  "./imagenes/orquidea.jpg",
  "./imagenes/deforestacion.jpg",

  // Fauna
  "./imagenes/fauna-portada.jpg",
  "./imagenes/mamiferos.jpg",
  "./imagenes/aves.jpg",
  "./imagenes/anfibios.jpg",
  "./imagenes/reptiles.jpg",
  "./imagenes/insectos.jpg",
  "./imagenes/faunaacuatica.jpg",

  // Flora y conservación
  "./imagenes/semillas.jpg",
  "./imagenes/orquidea%201.jpg",
  "./imagenes/bromelias.jpg",
  "./imagenes/helechos.jpg",
  "./imagenes/arbolesnativos.jpg",
  "./imagenes/musgos.jpg",
  "./imagenes/ilustracioneducativa.jpg",
  "./imagenes/restauracion.jpg",

  // Amenazas
  "./imagenes/amenaza-agua.jpg",
  "./imagenes/amenaza-quemas.jpg",
  "./imagenes/amenaza-residuos.jpg",
  "./imagenes/amenaza-bosques.jpg",
  "./imagenes/amenaza-especies.jpg",
  "./imagenes/amenaza-conservacion.jpg",

  // Educación
  "./imagenes/educacion-portada.jpg",
  "./imagenes/educacion-aula.jpg",
  "./imagenes/educacion-glosario.jpg",
  "./imagenes/educacion-reto.jpg",
  "./imagenes/educacion-compromiso.jpg",
  "./imagenes/educacion-biblioteca.jpg",
  "./imagenes/educacion-actividad.jpg",

  // Imágenes de amenazas
  "./imagenes/agua-principal.jpg",
  "./imagenes/agua-1.jpg",
  "./imagenes/agua-2.jpg",
  "./imagenes/quemas-principal.jpg",
  "./imagenes/quemas-1.jpg",
  "./imagenes/quemas-2.jpg",
  "./imagenes/residuos-principal.jpg",
  "./imagenes/residuos-1.jpg",
  "./imagenes/residuos-2.jpg",
  "./imagenes/bosques-principal.jpg",
  "./imagenes/bosques-1.jpg",
  "./imagenes/bosques-2.jpg",
  "./imagenes/especies-principal.jpg",
  "./imagenes/especies-1.jpg",
  "./imagenes/especies-2.jpg",
  "./imagenes/acciones-principal.jpg",
  "./imagenes/acciones-1.jpg",
  "./imagenes/acciones-2.jpg",

  // Videos de flora
  "./videos/orquideas-1.mp4",
  "./videos/orquideas-2.mp4",
  "./videos/bromelias-1.mp4",
  "./videos/bromelias-2.mp4",
  "./videos/helechos-1.mp4",
  "./videos/helechos-2.mp4",
  "./videos/arbolesnativos-1.mp4",
  "./videos/arbolesnativos-2.mp4",
  "./videos/musgos-1.mp4",
  "./videos/musgos-2.mp4",
  "./videos/plantasecosistemas-1.mp4",
  "./videos/plantasecosistemas-2.mp4",

  // Videos de fauna
  "./videos/mamiferos-1.mp4",
  "./videos/mamiferos-2.mp4",
  "./videos/aves-1.mp4",
  "./videos/aves-2.mp4",
  "./videos/anfibios-1.mp4",
  "./videos/anfibios-2.mp4",
  "./videos/reptiles-1.mp4",
  "./videos/reptiles-2.mp4",
  "./videos/insectos-1.mp4",
  "./videos/insectos-2.mp4",
  "./videos/fauna-acuatica-1.mp4",
  "./videos/fauna-acuatica-2.mp4",

  // Videos de amenazas
  "./videos/agua-1.mp4",
  "./videos/agua-2.mp4",
  "./videos/quemas-1.mp4",
  "./videos/quemas-2.mp4",
  "./videos/residuos-1.mp4",
  "./videos/residuos-2.mp4",
  "./videos/bosques-1.mp4",
  "./videos/bosques-2.mp4",
  "./videos/especies-1.mp4",
  "./videos/especies-2.mp4",
  "./videos/acciones-1.mp4",
  "./videos/acciones-2.mp4"
];

const esVideo = (url) =>
  /\.(mp4|webm|ogg|mov|m4v)$/i.test(url.pathname);

async function guardarArchivo(cache, archivo) {
  try {
    const url = new URL(archivo, self.registration.scope);
    const respuesta = await fetch(url.href, {
      cache: "no-store"
    });

    if (respuesta.ok && respuesta.type === "basic") {
      await cache.put(url.href, respuesta);
    } else {
      console.warn(
        "No se pudo guardar el archivo:",
        archivo,
        respuesta.status
      );
    }
  } catch (error) {
    console.warn("Error guardando:", archivo, error);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Guardar uno por uno para evitar demasiadas descargas simultáneas.
      for (const archivo of ARCHIVOS_INICIALES) {
        await guardarArchivo(cache, archivo);
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nombres = await caches.keys();

      await Promise.all(
        nombres
          .filter(
            (nombre) =>
              nombre.startsWith("vida-silvestre-") &&
              nombre !== CACHE_NAME
          )
          .map((nombre) => caches.delete(nombre))
      );

      await self.clients.claim();
    })()
  );
});

// Permite reproducir videos guardados incluso cuando el navegador
// solicita solamente un fragmento del archivo (HTTP Range).
async function responderVideo(solicitud, url) {
  const cache = await caches.open(CACHE_NAME);
  const guardado = await cache.match(url.href);

  if (guardado) {
    const rango = solicitud.headers.get("Range");

    if (!rango) {
      return guardado;
    }

    const coincidencia = rango.match(/^bytes=(\d*)-(\d*)$/);

    if (!coincidencia) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": "bytes */0"
        }
      });
    }

    const archivo = await guardado.arrayBuffer();
    const total = archivo.byteLength;

    let inicio;
    let fin;

    if (coincidencia[1] === "") {
      const sufijo = Number(coincidencia[2]);

      if (!sufijo || total === 0) {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${total}`
          }
        });
      }

      inicio = Math.max(total - sufijo, 0);
      fin = total - 1;
    } else {
      inicio = Number(coincidencia[1]);
      fin = coincidencia[2]
        ? Number(coincidencia[2])
        : total - 1;
    }

    if (
      inicio >= total ||
      fin < inicio ||
      total === 0
    ) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${total}`
        }
      });
    }

    fin = Math.min(fin, total - 1);

    return new Response(
      archivo.slice(inicio, fin + 1),
      {
        status: 206,
        headers: {
          "Content-Type":
            guardado.headers.get("Content-Type") ||
            "video/mp4",
          "Accept-Ranges": "bytes",
          "Content-Range":
            `bytes ${inicio}-${fin}/${total}`,
          "Content-Length": String(fin - inicio + 1)
        }
      }
    );
  }

  // Si todavía no está guardado, intentar obtenerlo de internet.
  try {
    const respuesta = await fetch(solicitud);

    if (
      respuesta.status === 200 &&
      respuesta.type === "basic"
    ) {
      await cache.put(url.href, respuesta.clone());
    }

    return respuesta;
  } catch (error) {
    return new Response(
      "Este video todavía no está disponible sin conexión. " +
      "Conéctate a internet y vuelve a cargarlo.",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }
}

self.addEventListener("fetch", (event) => {
  const solicitud = event.request;
  const url = new URL(solicitud.url);

  if (
    solicitud.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (esVideo(url)) {
    event.respondWith(responderVideo(solicitud, url));
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const respuesta = await fetch(solicitud);

        if (
          respuesta.ok &&
          respuesta.type === "basic"
        ) {
          const cache = await caches.open(CACHE_NAME);

          await cache.put(
            solicitud,
            respuesta.clone()
          );
        }

        return respuesta;
      } catch (error) {
        const guardada = await caches.match(solicitud, {
          ignoreSearch: true
        });

        if (guardada) {
          return guardada;
        }

        // Si una URL de navegación tiene parámetros, buscar
        // también la página HTML guardada sin esos parámetros.
        if (solicitud.mode === "navigate") {
          const pagina = await caches.match(url.pathname);

          if (pagina) {
            return pagina;
          }

          const inicio = await caches.match(
            new URL("./index.html", self.registration.scope).href
          );

          if (inicio) {
            return inicio;
          }
        }

        return new Response(
          "Este recurso no está disponible sin conexión.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      }
    })()
  );
});
