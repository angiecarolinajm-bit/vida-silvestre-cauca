
const CACHE_NAME = "vida-silvestre-v7";

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

  "./imagenes/cauca.jpg",
  "./imagenes/oso.jpg",
  "./imagenes/munchique.jpg",
  "./imagenes/orquidea.jpg",
  "./imagenes/deforestacion.jpg",
  "./imagenes/fauna-portada.jpg",
  "./imagenes/mamiferos.jpg",
  "./imagenes/aves.jpg",
  "./imagenes/anfibios.jpg",
  "./imagenes/reptiles.jpg",
  "./imagenes/insectos.jpg",
  "./imagenes/faunaacuatica.jpg",
  "./imagenes/semillas.jpg",
  "./imagenes/orquidea%201.jpg",
  "./imagenes/bromelias.jpg",
  "./imagenes/helechos.jpg",
  "./imagenes/arbolesnativos.jpg",
  "./imagenes/musgos.jpg",
  "./imagenes/ilustracioneducativa.jpg",
  "./imagenes/restauracion.jpg",

  "./imagenes/amenaza-agua.jpg",
  "./imagenes/amenaza-quemas.jpg",
  "./imagenes/amenaza-residuos.jpg",
  "./imagenes/amenaza-bosques.jpg",
  "./imagenes/amenaza-especies.jpg",
  "./imagenes/amenaza-conservacion.jpg",

  "./imagenes/educacion-portada.jpg",
  "./imagenes/educacion-aula.jpg",
  "./imagenes/educacion-glosario.jpg",
  "./imagenes/educacion-reto.jpg",
  "./imagenes/educacion-compromiso.jpg",
  "./imagenes/educacion-biblioteca.jpg",
  "./imagenes/educacion-actividad.jpg",

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

function esVideo(url) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url.pathname);
}

async function buscarEnCache(url) {
  const cache = await caches.open(CACHE_NAME);
  return cache.match(url, { ignoreSearch: true });
}

async function guardarArchivo(cache, archivo) {
  try {
    const url = new URL(archivo, self.registration.scope);
    const respuesta = await fetch(url.href, { cache: "reload" });

    if (respuesta.ok && respuesta.status === 200) {
      await cache.put(url.href, respuesta.clone());
      return true;
    }

    console.warn("No se pudo guardar:", archivo, respuesta.status);
  } catch (error) {
    console.warn("Error guardando:", archivo, error);
  }

  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    for (const archivo of ARCHIVOS_INICIALES) {
      await guardarArchivo(cache, archivo);
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const nombres = await caches.keys();

    await Promise.all(
      nombres
        .filter((nombre) =>
          nombre.startsWith("vida-silvestre-") &&
          nombre !== CACHE_NAME
        )
        .map((nombre) => caches.delete(nombre))
    );

    await self.clients.claim();
  })());
});

async function responderVideo(solicitud, url) {
  const cache = await caches.open(CACHE_NAME);
  let guardado = await cache.match(url.href);

  if (!guardado) {
    try {
      const respuesta = await fetch(
        new Request(url.href, {
          method: "GET",
          credentials: "same-origin"
        })
      );

      if (!respuesta.ok || respuesta.status !== 200) {
        return respuesta;
      }

      await cache.put(url.href, respuesta.clone());
      guardado = respuesta;
    } catch (error) {
      return new Response(
        "Este video no está guardado para usarlo sin conexión.",
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        }
      );
    }
  }

  if (!solicitud.headers.has("Range")) {
    return guardado;
  }

  const rango = solicitud.headers.get("Range");
  const coincidencia = rango.match(/^bytes=(\d*)-(\d*)$/);
  const archivo = await guardado.arrayBuffer();
  const total = archivo.byteLength;

  if (!coincidencia || (!coincidencia[1] && !coincidencia[2])) {
    return new Response(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${total}`
      }
    });
  }

  let inicio;
  let fin;

  if (coincidencia[1] === "") {
    const sufijo = Number(coincidencia[2]);

    if (sufijo <= 0 || total === 0) {
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
    fin = coincidencia[2] === ""
      ? total - 1
      : Number(coincidencia[2]);
  }

  fin = Math.min(fin, total - 1);

  if (inicio < 0 || inicio >= total || fin < inicio) {
    return new Response(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${total}`
      }
    });
  }

  const fragmento = archivo.slice(inicio, fin + 1);
  const headers = new Headers(guardado.headers);

  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${inicio}-${fin}/${total}`);
  headers.set("Content-Length", String(fragmento.byteLength));

  return new Response(fragmento, {
    status: 206,
    headers
  });
}

self.addEventListener("fetch", (event) => {
  const solicitud = event.request;

  if (solicitud.method !== "GET") return;

  const url = new URL(solicitud.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    if (esVideo(url)) {
      return responderVideo(solicitud, url);
    }

    const guardado = await buscarEnCache(url.href);

    if (guardado) {
      return guardado;
    }

    try {
      const respuesta = await fetch(solicitud);

      if (respuesta.ok && respuesta.status === 200) {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(url.href, respuesta.clone());
        } catch (error) {
          console.warn("No se pudo guardar:", url.href, error);
        }
      }

      return respuesta;
    } catch (error) {
      return new Response(
        solicitud.mode === "navigate"
          ? "Esta página no está guardada para usarla sin conexión."
          : "Este recurso no está disponible sin conexión.",
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        }
      );
    }
  })());
});
