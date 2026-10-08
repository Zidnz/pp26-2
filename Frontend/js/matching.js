/* Cálculo de compatibilidad petición ↔ profesional. */
(function () {
  'use strict';

  function haversineKm(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
    const x = Math.sin(dLat / 2) ** 2 +
      Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function distanciaKm(zonaA, zonaB) {
    const a = Care.ZONAS[zonaA], b = Care.ZONAS[zonaB];
    if (!a || !b) return null;
    return haversineKm(a, b);
  }

  // Proporción de `requeridos` cubierta por `ofrecidos` (1 si no se requiere nada).
  function cobertura(requeridos, ofrecidos) {
    if (!requeridos.length) return 1;
    const set = new Set(ofrecidos);
    return requeridos.filter((x) => set.has(x)).length / requeridos.length;
  }

  // Restricciones duras: perfil requerido y tipo de cuidado que atiende.
  function elegible(pub, cui) {
    if (pub.perfil !== 'cualquiera' && pub.perfil !== cui.perfil) return false;
    return cui.tipos.includes(pub.tipo);
  }

  // Turnos solicitados que el profesional puede cubrir.
  function turnosCubiertos(pub, cui) {
    const set = new Set(cui.turnos);
    return pub.turnos.filter((t) => set.has(t)).length;
  }

  /** null si no es elegible; si lo es, { total (0-100), partes (0-1 c/u), km }. */
  function score(pub, cui, cfg) {
    if (!elegible(pub, cui)) return null;
    const km = distanciaKm(pub.zona, cui.zona);
    const partes = {
      hab: cobertura(pub.necesidades, cui.habilidades),
      zona: km == null ? 0 : Math.max(0, 1 - km / cfg.maxKm),
      turnos: cobertura(pub.turnos, cui.turnos),
      tarifa: cui.tarifa <= pub.presupuesto
        ? 1
        : Math.max(0, 1 - (cui.tarifa - pub.presupuesto) / pub.presupuesto),
    };
    const w = cfg.pesos;
    const suma = w.hab + w.zona + w.turnos + w.tarifa;
    const total = suma > 0
      ? Math.round(100 * (w.hab * partes.hab + w.zona * partes.zona + w.turnos * partes.turnos + w.tarifa * partes.tarifa) / suma)
      : 0;
    return { total, partes, km };
  }

  function rankPara(pub, cuidadores, cfg) {
    return cuidadores
      .map((c) => ({ cui: c, m: score(pub, c, cfg) }))
      .filter((r) => r.m)
      .sort((a, b) => b.m.total - a.m.total);
  }

  window.Care.matching = { score, elegible, rankPara, distanciaKm, turnosCubiertos };
})();
