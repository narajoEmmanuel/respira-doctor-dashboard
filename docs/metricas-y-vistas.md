# Métricas y vistas — RESPIRA+ · Doctor Dashboard

Este documento describe los **indicadores y vistas** que el dashboard calcula y muestra a partir de un JSON exportado. Todo lo aquí expuesto está verificado en el código fuente actual (`src/utils/`, `src/components/`).

El dashboard es una herramienta de **visualización y apoyo a la revisión**; las métricas **no constituyen** diagnóstico, prescripción ni validación clínica formal.

---

## Sesiones consideradas en los cálculos

Antes de calcular métricas, el código filtra las sesiones mediante `partitionSessionsByClinicalRelevance` (`src/utils/sessionClassification.ts`).

### Sesiones incluidas

Una sesión se incluye si cumple **todas** las condiciones de `isClinicalSensorSession`:

- `input_mode === 'sensor'`
- `data_source === 'sensor_model'`
- `is_practice_session === false`
- `official_validation_source === 'sensor_model'`

### Sesiones excluidas

- Sesiones de **práctica**: `is_practice_session === true`, `input_mode === 'touch_practice'` o `data_source === 'touch_simulation'`.
- Sesiones que **no cumplen** el criterio estricto anterior (p. ej. sin clasificar, modo táctil, estimaciones no validadas por el modelo de sensor).

Esta regla es un **filtro técnico de datos exportados**, no una validación clínica regulada. Si no hay sesiones incluidas, la interfaz muestra `ClinicalEmptyState` con un mensaje explicativo.

---

## Meta diaria de referencia

Constante `DAILY_SESSION_GOAL = 6` (`src/types/adherence.ts`):

- **6 sesiones con sensor por día activo**, alineada en la interfaz con seguimiento **postoperatorio**.
- Un **día completo** cumple la meta de 6 sesiones incluidas en ese día calendario.
- Un **día perfecto** cumple 6/6 sesiones marcadas como `perfect: true` en los datos exportados.

La meta semanal agregada en vista *Días de la semana* es **42 sesiones** (6 × 7 días), según `TemporalChartsGrid`.

---

## Sección: Adherencia al tratamiento

Componentes: `AdherenceKpis`, `AdherenceSummary`. Cálculo: `computeAdherenceMetrics`, `buildAdherenceSummary` en `src/utils/adherenceMetrics.ts`.

| Indicador | Descripción |
|-----------|-------------|
| **Días con entrenamiento completo** | Porcentaje y conteo de días activos con ≥ 6 sesiones incluidas. |
| **Días con entrenamiento perfecto** | Porcentaje y conteo de días con 6/6 sesiones perfectas. |
| **Promedio sesiones / día activo** | Media de sesiones incluidas en días con al menos una sesión. |
| **Mejor racha de adherencia** | Máximo de días consecutivos cumpliendo 6/6 sesiones completas. |
| **Racha actual** | Días consecutivos recientes cumpliendo 6/6 completadas. |
| **Días con interrupciones** | Porcentaje de días activos con al menos una sesión con `interrupted === true`. |

### Resumen interpretativo de adherencia

`AdherenceSummary` muestra textos generados por **reglas programadas** (p. ej. constancia postoperatoria, días incompletos, interrupciones frecuentes). Son **orientativos** y no sustituyen el juicio del profesional de la salud.

---

## Sección: Contexto de seguimiento respiratorio

Componente: `SecondaryClinicalKpis`. Cálculo: `computeDashboardMetrics` en `src/utils/metrics.ts`.

| Indicador | Origen en datos / cálculo |
|-----------|---------------------------|
| **VIM actual** | Último `max_inspiratory_volume` en `diagnostics` ordenado por `diagnostic_date`. |
| **Nivel actual** | Etiqueta derivada de `patient.current_level_id`. |
| **Meta del nivel activo** | `target_volume` del nivel con `level_status === 'active'`, o del nivel coincidente con `current_level_id`. |
| **Volumen máximo registrado** | Máximo `max_volume` entre sesiones incluidas. |
| **Cumplimiento promedio** | Promedio de cumplimiento efectivo por sesión (`averageEffectiveCompliancePercent` en `src/utils/complianceMetrics.ts`). |
| **Mejor tiempo de sostén** | Máximo `hold_ms` entre intentos de sesiones incluidas, convertido a segundos. |

---

## Sección: Evolución por periodo

Componente: `TemporalSection`. Vistas (`TemporalViewMode`):

| Vista | Etiqueta en UI | Contenido |
|-------|----------------|-----------|
| `session-day` | Sesiones del día | Gráficas y tabla de sesiones de un día navegable. |
| `week-days` | Días de la semana | Resumen de siete días de una semana navegable. |

Navegación: `PeriodRangeNavigator` sobre días o semanas con sesiones incluidas (`buildClinicalTimeline` en `src/utils/temporalNavigation.ts`).

### Gráficas del periodo visible

Implementadas en `TemporalChartsGrid` y subcomponentes en `src/components/charts/temporal/`:

1. **Cumplimiento promedio** — Promedio de cumplimiento de sesiones incluidas por bucket temporal (`CompliancePerPeriodChart`).
2. **Volumen máximo y promedio vs meta** — Comparación con `activeLevelTargetMl` (`VolumeVsTargetChart`).
3. **Sesiones vs meta esperada** — Meta diaria (6) o tarjeta del día; en vista semanal, meta de 42 sesiones (`SessionsVsGoalChart`, `DailyAdherenceGoalCard`).
4. **Calidad de sesiones** — Donut con distribución (`SessionQualityDonutChart`).

### Clasificación de calidad de sesión

`buildSessionQualityBreakdown` (`src/utils/sessionQualityMetrics.ts`):

| Segmento | Criterio |
|----------|----------|
| Perfectas | `perfect === true` y no interrumpida |
| Interrumpidas | `interrupted === true` |
| Completadas, no perfectas | `completed === true` sin ser perfecta ni interrumpida |
| Otras / incompletas | Resto |

### Tablas de detalle

| Vista | Componente | Contenido |
|-------|------------|-----------|
| Sesiones del día | `TemporalSessionsDetailTable` | Sesiones visibles del día seleccionado |
| Días de la semana | `TemporalWeekDaysDetailTable` | Resumen diario de la semana visible |

---

## Encabezado del dashboard

Componente: `Dashboard`. Muestra:

- Nombre, clave y edad del paciente.
- Fecha de exportación (`exported_at`).
- Nombre del archivo cargado.
- Acción *Cargar otro archivo* (reinicia el flujo sin persistencia en servidor).

---

## Datos calculados pero no expuestos en vistas activas

`computeDashboardMetrics` también produce `sessionRows` (filas de sesión con clasificación, cumplimiento, volúmenes e intentos). Existe el componente `SessionsTable`, pero **no está conectado** al flujo principal actual documentado en `Dashboard.tsx`. No se describe aquí como funcionalidad activa.

---

## Días calendario

Las claves de día usan formato local `YYYY-MM-DD` (`src/utils/dateKeys.ts`), alineado con el criterio documentado en comentarios del código respecto a RESPIRA+.

---

## Límites interpretativos

- Las métricas reflejan **únicamente** el contenido del JSON exportado en el momento de la exportación; no hay datos en tiempo real.
- Los umbrales de los textos de adherencia (p. ej. 70 % de días completos, racha ≥ 5) son **umbrales de la interfaz**, no guías clínicas validadas.
- No se infiere eficacia terapéutica ni evolución clínica definitiva a partir de estos indicadores.

Para alcance legal y clínico del prototipo, véase [descargo-y-limites.md](./descargo-y-limites.md).
