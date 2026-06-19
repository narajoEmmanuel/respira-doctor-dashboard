# Formato de exportación JSON — RESPIRA+

Este documento describe la estructura del archivo JSON que el **RESPIRA+ · Doctor Dashboard** acepta para visualización local. La definición tipada reside en `src/types/export.ts`; la validación mínima al cargar el archivo, en `src/utils/validation.ts`.

---

## Origen y rol del archivo

La aplicación móvil RESPIRA+ permite generar una **exportación JSON** con datos de un paciente: perfil, registros de capacidad respiratoria, niveles de entrenamiento y sesiones con sus intentos. El dashboard **no se conecta** a la app ni a un backend: el profesional transfiere el archivo manualmente (p. ej. por almacenamiento local, correo o medio acordado en su entorno) y lo carga en el navegador.

Convención de nombre sugerida en la interfaz: `respira_export.json`. Se acepta cualquier archivo con extensión `.json` que cumpla la estructura esperada.

> **TODO: referencia pendiente** — Documentación oficial del proceso de exportación en la app móvil RESPIRA+.

---

## Estructura general del objeto raíz

El archivo debe ser un **objeto JSON** con los campos siguientes:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `export_version` | cadena no vacía | Sí | Identificador de versión del formato de exportación. |
| `exported_at` | cadena no vacía | Sí | Marca temporal de la exportación. |
| `patient` | objeto | Sí (no `null`) | Datos del paciente. |
| `diagnostics` | arreglo | Sí | Registros de capacidad respiratoria (p. ej. VIM). |
| `patient_levels` | arreglo | Sí | Niveles de entrenamiento y metas asociadas. |
| `sessions` | arreglo | Sí | Sesiones; cada elemento incluye `session` y `attempts`. |

Si falta algún campo obligatorio, el parseo falla y la interfaz muestra un mensaje de error.

---

## Compatibilidad de versión

La interfaz del dashboard indica compatibilidad con exportaciones RESPIRA+ en formato **v2.x**. El código **no valida** un valor concreto de `export_version` más allá de exigir que sea una cadena no vacía.

> **TODO: referencia pendiente** — Matriz de compatibilidad exacta por valor de `export_version` (p. ej. qué versiones minor/patch han sido probadas).

---

## Objeto `patient`

Campos tipados en `PatientRecord`:

| Campo | Tipo | Uso en el dashboard |
|-------|------|---------------------|
| `paciente_id` | número | Identificador interno |
| `clave` | cadena | Clave del paciente (mostrada en encabezado) |
| `nombre_completo` | cadena | Nombre mostrado en encabezado |
| `edad` | número | Edad en encabezado |
| `current_level_id` | `level-1` … `level-5` o `null` | Nivel actual del paciente |
| `racha_actual` | número | Dato exportado (la racha del dashboard se recalcula desde sesiones) |
| `ultima_fecha_cumplida` | cadena o `null` | Dato exportado |
| `fecha_creacion` | cadena | Dato exportado |

---

## Arreglo `diagnostics`

Cada elemento (`DiagnosticRecord`) puede incluir:

| Campo | Tipo | Uso en el dashboard |
|-------|------|---------------------|
| `diagnostic_id` | número | Identificador |
| `patient_id` | número | Referencia al paciente |
| `diagnostic_number` | número | Número de registro |
| `diagnostic_date` | cadena | Fecha del registro |
| `max_inspiratory_volume` | número | VIM; el dashboard toma el más reciente por fecha |

---

## Arreglo `patient_levels`

Cada elemento (`PatientLevelRecord`) describe un nivel de entrenamiento:

| Campo | Tipo | Uso en el dashboard |
|-------|------|---------------------|
| `patient_level_id` | número | Identificador |
| `patient_id` | número | Referencia al paciente |
| `level_id` | `level-1` … `level-5` | Identificador de nivel |
| `diagnostic_id` | número | Referencia al diagnóstico asociado |
| `target_volume` | número | Meta de volumen (mL) del nivel |
| `level_status` | `active`, `locked`, `completed` | El nivel `active` define la meta de volumen mostrada |
| `perfect_sessions_completed` | número | Dato exportado |
| `sessions_completed_today` | número | Dato exportado |
| `last_session_date` | cadena o `null` | Dato exportado |

---

## Arreglo `sessions`

Cada elemento debe tener la forma:

```json
{
  "session": { ... },
  "attempts": [ ... ]
}
```

### Objeto `session` (`SessionRecord`)

Campos relevantes para visualización y filtrado:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `session_id` | número | Obligatorio en validación |
| `session_date` | cadena | Obligatorio en validación |
| `patient_id`, `patient_level_id`, `level_id` | número / nivel | Contexto de la sesión |
| `valid_attempts`, `total_attempts`, `invalid_attempts` | número | Conteo de intentos |
| `compliance_percent` | número | Cumplimiento de la sesión |
| `max_volume`, `avg_volume` | número | Volúmenes en mL |
| `avg_hold_seconds` | número | Tiempo de sostén promedio |
| `completed`, `perfect` | booleano | Estado de la sesión |
| `interrupted` | booleano opcional | Sesión interrumpida |
| `input_mode` | cadena | p. ej. `sensor`, `touch` |
| `data_source` | cadena | p. ej. `sensor_model`, `touch_estimate` |
| `is_practice_session` | booleano opcional | Sesión de práctica |
| `official_validation_source` | cadena opcional | Fuente de validación del dato |
| `max_sensor_estimated_volume_ml`, `max_sensor_u95_ml` | número o `null` | Estimaciones del sensor |

La validación mínima exige `session_id` numérico y `session_date` como cadena no vacía. **No valida** el resto de campos de sesión ni el contenido de `attempts`.

### Arreglo `attempts` (`AttemptRecord`)

Campos tipados (entre otros):

| Campo | Tipo | Uso |
|-------|------|-----|
| `attempt_id`, `session_id` | número | Identificadores |
| `hold_ms` | número | Tiempo de sostén en milisegundos |
| `peak_volume` | número | Volumen pico del intento |
| `valid` | booleano | Intentos válidos vs inválidos |
| `created_at` | cadena | Marca temporal |
| `input_mode`, `data_source` | cadena opcional | Origen del dato |
| `official_volume_ml`, `sensor_estimated_volume_ml`, `sensor_u95_ml` | número o `null` | Volúmenes del intento |
| `sensor_confidence_label`, `sensor_attempt_status` | cadena o `null` | Metadatos del sensor |

El dashboard usa `hold_ms` de los intentos para calcular el **mejor tiempo de sostén** entre sesiones incluidas.

---

## Validación al cargar el archivo

Flujo implementado en `src/App.tsx`:

1. Lectura del archivo como texto (`FileReader` en `src/utils/fileReader.ts`).
2. Parseo JSON (`JSON.parse`).
3. Validación estructural (`parseClinicalExportJson` → `validateClinicalExport`).

Errores habituales reportados al usuario:

- Archivo que no es JSON válido.
- Falta de `export_version`, `exported_at` o arreglos obligatorios.
- `patient` ausente o `null`.
- Elemento de `sessions` sin `session` o sin arreglo `attempts`.
- `session_id` no numérico o `session_date` vacío.

---

## Límites del formato en este repositorio

- La validación es **estructural y mínima**; no comprueba coherencia clínica, rangos fisiológicos ni integridad referencial entre tablas.
- No hay esquema JSON externo (p. ej. JSON Schema) publicado en este repositorio.
- No se aceptan CSV ni otros formatos; solo `.json`.
- Las sesiones no incluidas por las reglas de filtrado del dashboard (véase [metricas-y-vistas.md](./metricas-y-vistas.md)) permanecen en el archivo pero **no alimentan** los indicadores principales.
- No existe un archivo JSON de ejemplo incluido en el repositorio para pruebas offline.

> **TODO: referencia pendiente** — Archivo JSON de ejemplo anonimizado para pruebas.

---

## Relación con otros documentos

- Criterios de qué sesiones del JSON se usan en métricas: [metricas-y-vistas.md](./metricas-y-vistas.md).
- Privacidad y responsabilidad sobre el archivo: [descargo-y-limites.md](./descargo-y-limites.md).
- Implementación en código: [guia-desarrollador.md](./guia-desarrollador.md).
