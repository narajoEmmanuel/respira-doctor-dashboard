# Documentación — RESPIRA+ · Doctor Dashboard

Esta carpeta reúne la documentación especializada del dashboard del doctor. Complementa el [README principal](../README.md), que conserva la visión general, el flujo de uso y la instalación rápida.

---

## Propósito de cada documento

| Documento | Contenido | Audiencia principal |
|-----------|-----------|---------------------|
| [formato-exportacion.md](./formato-exportacion.md) | Estructura del JSON exportado desde RESPIRA+, campos tipados, validación mínima y límites del formato | Profesional de la salud, integradores |
| [metricas-y-vistas.md](./metricas-y-vistas.md) | Métricas calculadas, criterios de inclusión de sesiones, gráficas y vistas temporales | Profesional de la salud, evaluadores del prototipo |
| [descargo-y-limites.md](./descargo-y-limites.md) | Alcance académico, privacidad local, límites clínicos y responsabilidades | Todo usuario del dashboard |
| [guia-desarrollador.md](./guia-desarrollador.md) | Stack, estructura del repositorio, scripts, flujo de código y pendientes técnicos | Desarrolladores y colaboradores académicos |

---

## Ruta de lectura recomendada

### Para el profesional de la salud o evaluador del prototipo

1. [README principal](../README.md) — contexto, instalación y flujo de uso.
2. [descargo-y-limites.md](./descargo-y-limites.md) — qué puede y qué no puede hacer la herramienta.
3. [formato-exportacion.md](./formato-exportacion.md) — qué contiene el archivo JSON que se carga.
4. [metricas-y-vistas.md](./metricas-y-vistas.md) — interpretación técnica de los indicadores mostrados.

### Para desarrolladores

1. [README principal](../README.md) — visión general e instalación.
2. [guia-desarrollador.md](./guia-desarrollador.md) — arquitectura local y convenciones del código.
3. [formato-exportacion.md](./formato-exportacion.md) — contrato de datos entre la app RESPIRA+ y el dashboard.
4. [metricas-y-vistas.md](./metricas-y-vistas.md) — reglas de cálculo implementadas en `src/utils/`.

---

## Alcance documental

Toda la documentación de esta carpeta describe el **estado actual del código** en este repositorio. No afirma eficacia clínica, registro sanitario ni validación formal. Donde falte respaldo interno verificable, se indica explícitamente **TODO: referencia pendiente**.
