# Guía para desarrolladores — RESPIRA+ · Doctor Dashboard

Guía técnica del repositorio del dashboard del doctor. Para contexto de producto, instalación rápida y flujo del profesional, véase el [README principal](../README.md).

---

## Stack tecnológico

Según `package.json`:

| Tecnología | Versión declarada | Rol |
|------------|-------------------|-----|
| React | ^19.2.6 | Interfaz de usuario |
| React DOM | ^19.2.6 | Renderizado |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite | ^8.0.12 | Bundler y servidor de desarrollo |
| Recharts | ^3.8.1 | Gráficas |
| ESLint | ^10.3.0 | Linting |

El proyecto usa módulos ES (`"type": "module"`).

> **TODO: referencia pendiente** — Requisito mínimo de versión de Node.js (no declarado en `package.json`).

---

## Scripts npm

| Comando | Acción |
|---------|--------|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo Vite (por defecto `http://localhost:5173`) |
| `npm run build` | `tsc -b` + build de producción estática en `dist/` |
| `npm run preview` | Sirve localmente el contenido de `dist/` |
| `npm run lint` | ESLint sobre el árbol del proyecto |

No hay scripts de test documentados en `package.json`.

---

## Variables de entorno

**No se requieren variables de entorno.** El repositorio no incluye `.env` ni uso de `import.meta.env` en el código fuente.

---

## Procesamiento local (flujo de datos)

```
Usuario selecciona .json
        ↓
readFileAsText (FileReader)
        ↓
parseClinicalExportJson → validateClinicalExport
        ↓
computeDashboardMetrics
        ↓
Dashboard + TemporalSection (React state en memoria)
```

Archivos clave:

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/App.tsx` | Estado global de vista (`upload` \| `dashboard`), manejo de errores |
| `src/utils/fileReader.ts` | Lectura del archivo como texto |
| `src/utils/validation.ts` | Validación estructural del JSON |
| `src/utils/metrics.ts` | Métricas agregadas del dashboard |
| `src/utils/adherenceMetrics.ts` | Adherencia y resumen interpretativo |
| `src/utils/sessionClassification.ts` | Filtrado de sesiones incluidas |
| `src/utils/temporalMetrics.ts` | Análisis temporal y buckets para gráficas |
| `src/utils/complianceMetrics.ts` | Cumplimiento efectivo por sesión |

No hay llamadas HTTP, WebSockets ni almacenamiento persistente del lado cliente más allá del estado React en memoria.

---

## Estructura del repositorio

```
respira-doctor-dashboard/
├── docs/                   # Documentación especializada (esta carpeta)
├── public/                 # Assets estáticos
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   └── temporal/   # Gráficas activas de evolución temporal
│   │   ├── Dashboard.tsx
│   │   ├── UploadScreen.tsx
│   │   ├── AdherenceKpis.tsx
│   │   ├── AdherenceSummary.tsx
│   │   ├── SecondaryClinicalKpis.tsx
│   │   ├── TemporalSection.tsx
│   │   └── …               # Tablas y navegación temporal
│   ├── theme/tokens.ts     # Marca RESPIRA+
│   ├── types/              # export.ts, adherence.ts, temporal.ts
│   ├── utils/              # Lógica de negocio y métricas
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── package.json
└── README.md
```

---

## Componentes principales (flujo activo)

| Componente | Función |
|------------|---------|
| `UploadScreen` | Zona de carga; acepta solo `.json` |
| `Dashboard` | Layout principal tras carga exitosa |
| `AdherenceKpis` | KPIs de adherencia (meta 6 sesiones/día) |
| `AdherenceSummary` | Textos interpretativos orientativos |
| `SecondaryClinicalKpis` | VIM, nivel, meta, volumen, cumplimiento, sostén |
| `TemporalSection` | Vistas día/semana, gráficas y tablas |
| `TemporalChartsGrid` | Cuatro gráficas del periodo visible |
| `ClinicalEmptyState` | Estado vacío sin sesiones incluidas |

---

## Componentes heredados no conectados

Existen en el árbol de código pero **no se importan** en el flujo principal (`App.tsx` → `Dashboard.tsx`):

- `SessionsTable.tsx`
- `charts/VolumeChart.tsx`
- `charts/ComplianceChart.tsx`
- `charts/LevelProgressChart.tsx`

No forman parte de la funcionalidad activa documentada. Pueden reutilizarse o eliminarse en refactorizaciones futuras.

---

## Tipos y contrato de datos

- **Export JSON:** `ClinicalExportSnapshot` y tipos relacionados en `src/types/export.ts`.
- **Adherencia:** `AdherenceMetrics`, `DAILY_SESSION_GOAL` en `src/types/adherence.ts`.
- **Temporal:** `TemporalViewMode` en `src/types/temporal.ts`.

Documentación del formato: [formato-exportacion.md](./formato-exportacion.md).

---

## Convenciones observadas

- Métricas y filtrado concentrados en `src/utils/`; componentes orientados a presentación.
- Clasificación estricta de sesiones con sensor en `isClinicalSensorSession`.
- Días calendario en clave local `YYYY-MM-DD` (`dateKeys.ts`).
- Marca unificada como **RESPIRA+** en `src/theme/tokens.ts`.

---

## Pendientes técnicos documentados

| Tema | Estado |
|------|--------|
| Archivo JSON de ejemplo anonimizado | TODO: referencia pendiente |
| Matriz de `export_version` | TODO: referencia pendiente |
| Versión mínima de Node.js | TODO: referencia pendiente |
| Tests automatizados | No implementados en el repositorio |
| CI/CD o despliegue | No documentado |
| Enlace al repo de la app RESPIRA+ | TODO: referencia pendiente |
| Componentes heredados sin uso | Presentes; sin plan de deprecación documentado |

---

## Documentos relacionados

- [docs/README.md](./README.md) — Índice de documentación
- [metricas-y-vistas.md](./metricas-y-vistas.md) — Reglas de cálculo
- [descargo-y-limites.md](./descargo-y-limites.md) — Límites del prototipo
