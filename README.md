# RESPIRA+ · Doctor Dashboard

## Resumen ejecutivo

**RESPIRA+ · Doctor Dashboard** es una herramienta web de carácter **académico y prototípico** desarrollada como complemento del ecosistema **RESPIRA+**. Su función consiste en **visualizar y revisar**, de forma local en el navegador, los datos contenidos en archivos JSON exportados desde la aplicación móvil RESPIRA+.

El dashboard **no constituye** un sistema clínico certificado, un instrumento diagnóstico, un prescriptor terapéutico ni un sustituto del criterio del profesional de la salud. Ofrece apoyo para la **consulta estructurada de indicadores de seguimiento** —adherencia, sesiones de entrenamiento respiratorio con sensor, volúmenes y evolución temporal— a partir de información previamente registrada en la app por el paciente.

Todo el procesamiento ocurre **en el dispositivo del usuario**: no hay backend, autenticación, base de datos remota ni envío de archivos a servidores, según el estado actual del código fuente de este repositorio.

---

## Documentación adicional

Documentación especializada en la carpeta [`docs/`](./docs/):

- [Índice de documentación](./docs/README.md)
- [Formato de exportación JSON](./docs/formato-exportacion.md)
- [Métricas y vistas](./docs/metricas-y-vistas.md)
- [Descargo y límites](./docs/descargo-y-limites.md)
- [Guía para desarrolladores](./docs/guia-desarrollador.md)

---

## Relación con RESPIRA+

RESPIRA+ es un proyecto orientado al **seguimiento de pacientes adultos en contexto postoperatorio** mediante ejercicios respiratorios asociados a un espirómetro incentivador y registro de sesiones en la aplicación móvil. Cuando el paciente o el equipo asistencial genera una **exportación JSON** desde la app, el profesional puede cargar ese archivo en este dashboard para obtener una vista consolidada de los datos exportados.

Este repositorio documenta únicamente el **dashboard del doctor** (visualización en navegador). No incluye el código de la app móvil ni de un backend centralizado.

> **TODO: referencia pendiente** — URL o referencia formal al repositorio o documentación de la aplicación móvil RESPIRA+.

---

## Propósito del dashboard

El dashboard permite al profesional de la salud:

1. **Cargar** un archivo JSON exportado desde RESPIRA+.
2. **Consultar** datos identificativos del paciente y la fecha de exportación.
3. **Revisar** indicadores de adherencia, desempeño en sesiones con sensor y evolución por día o por semana.
4. **Apoyar** el seguimiento estructurado del entrenamiento respiratorio postoperatorio registrado en la app.

La herramienta facilita la **visualización de datos ya exportados**; la interpretación clínica, las decisiones terapéuticas y la responsabilidad asistencial permanecen en el profesional de la salud.

---

## Naturaleza académica y estado del prototipo

| Aspecto | Estado actual |
|---------|---------------|
| Naturaleza del artefacto | Prototipo académico / herramienta de apoyo a la revisión de datos |
| Versión en `package.json` | `0.0.0` |
| Backend | No implementado |
| Autenticación / login | No implementado |
| Almacenamiento persistente en servidor | No implementado |
| Despliegue clínico documentado | No documentado en este repositorio |
| Archivo JSON de ejemplo incluido | No incluido en el repositorio |

El proyecto se encuentra en **desarrollo académico**. Las funcionalidades descritas en este documento corresponden al comportamiento observable en el código fuente actual; no deben interpretarse como un producto sanitario terminado ni como evidencia de eficacia clínica.

---

## Alcance

### Lo que sí hace

- **Visualización** de datos contenidos en exportaciones JSON compatibles con RESPIRA+.
- **Cálculo en cliente** de métricas de adherencia, cumplimiento, volumen y calidad de sesiones, según reglas definidas en el código.
- **Presentación gráfica y tabular** de la evolución por día o por semana.
- **Procesamiento local** mediante `FileReader` y análisis en memoria del navegador.

### Lo que no hace

- No **diagnostica** condiciones médicas.
- No **prescribe** tratamientos ni modifica parámetros terapéuticos en la app del paciente.
- No sustituye la **evaluación clínica** del profesional de la salud.
- No cuenta con **registro sanitario**, aprobación regulatoria (p. ej. COFEPRIS) ni **validación clínica formal** documentada en este repositorio.
- No toma **decisiones clínicas autónomas**; los textos interpretativos de adherencia son orientativos y derivados de reglas programadas, no de juicio médico.

---

## Flujo de uso del profesional de la salud

1. **Abrir el dashboard** en el navegador (modo desarrollo local o build estático servido localmente).
2. **Cargar el archivo JSON** exportado desde RESPIRA+ (convención de nombre sugerida: `respira_export.json`; se acepta cualquier archivo con extensión `.json` válido).
3. **Revisar los datos del paciente** mostrados en el encabezado: nombre, clave, edad y fecha de exportación.
4. **Consultar los indicadores principales** de adherencia al entrenamiento diario (meta de sesiones con sensor, días completos, días perfectos, rachas e interrupciones).
5. **Revisar el contexto de seguimiento**: volumen inspiratorio máximo (VIM) registrado, nivel activo, meta de volumen del nivel, cumplimiento promedio y mejor tiempo de sostén.
6. **Explorar la evolución temporal** en las vistas *Sesiones del día* y *Días de la semana*, con gráficas y tablas de detalle.
7. **Cargar otro archivo** cuando sea necesario mediante la acción *Cargar otro archivo*, sin persistencia entre sesiones del navegador más allá del estado en memoria.

---

## Privacidad y manejo de datos

- El archivo JSON seleccionado se **lee únicamente en el navegador** del usuario mediante la API `FileReader`.
- Los datos **no se transmiten** a servidores externos como parte del flujo implementado en este repositorio.
- No hay integración con Supabase, APIs remotas ni servicios de autenticación en el código actual.
- Al cerrar o recargar la página, los datos cargados **dejan de estar disponibles** en la interfaz (no hay almacenamiento persistente en servidor).

El responsable del manejo del archivo exportado —incluida su custodia, transmisión fuera de este dashboard y eliminación— es quien opera la herramienta en su entorno de trabajo.

> **TODO: referencia pendiente** — Política formal de retención o eliminación de datos para uso en entorno clínico real.

---

## Formato general del archivo JSON

El dashboard espera un objeto JSON con la estructura validada en `src/utils/validation.ts` y tipada en `src/types/export.ts`. Campos principales:

| Campo | Descripción |
|-------|-------------|
| `export_version` | Versión del formato de exportación (cadena obligatoria). |
| `exported_at` | Marca temporal de la exportación (cadena obligatoria). |
| `patient` | Datos del paciente (objeto obligatorio; no puede ser `null`). |
| `diagnostics` | Arreglo de registros diagnósticos de capacidad respiratoria (p. ej. VIM). |
| `patient_levels` | Arreglo de niveles del paciente y metas de volumen asociadas. |
| `sessions` | Arreglo de sesiones; cada elemento debe incluir `session` y `attempts`. |
| `session` | Metadatos de la sesión (identificador, fecha, nivel, intentos, cumplimiento, volúmenes, banderas de calidad, modo de entrada, etc.). |
| `attempts` | Arreglo de intentos individuales dentro de la sesión (volumen pico, tiempo de sostén, validez, etc.). |

La interfaz indica compatibilidad con exportaciones de RESPIRA+ en formato **v2.x**. El código valida la presencia de campos mínimos; no garantiza por sí solo la integridad clínica del contenido exportado.

> **TODO: referencia pendiente** — Matriz de compatibilidad exacta por valor de `export_version`.

---

## Métricas e indicadores implementados

Las métricas siguientes se calculan **únicamente a partir de sesiones incluidas según los criterios descritos más adelante** (sesiones con sensor clasificadas como válidas para el dashboard). Si no hay sesiones elegibles, la interfaz muestra un estado vacío explicativo.

### Adherencia al entrenamiento

- **Meta diaria**: 6 sesiones con sensor por día activo (constante `DAILY_SESSION_GOAL` en el código; orientada al seguimiento postoperatorio).
- **Días con entrenamiento completo**: porcentaje y conteo de días que alcanzan la meta diaria.
- **Días con entrenamiento perfecto**: porcentaje y conteo de días con 6/6 sesiones perfectas.
- **Promedio de sesiones por día activo**.
- **Mejor racha de adherencia** y **racha actual** (días consecutivos cumpliendo 6/6).
- **Días con interrupciones**: porcentaje de días con al menos una sesión interrumpida.
- **Resumen interpretativo de adherencia**: textos orientativos generados por reglas programadas (p. ej. constancia, días incompletos); no constituyen recomendación clínica.

### Contexto de seguimiento respiratorio

- **VIM actual**: último volumen inspiratorio máximo registrado en `diagnostics`.
- **Nivel activo** del paciente en la exportación.
- **Meta de volumen** del nivel activo.
- **Volumen máximo registrado** entre sesiones incluidas.
- **Cumplimiento promedio** de sesiones incluidas.
- **Mejor tiempo de sostén** entre intentos de sesiones incluidas.

### Evolución temporal

Vistas disponibles:

- **Sesiones del día**: gráficas y tabla de detalle por sesiones de un día seleccionable.
- **Días de la semana**: resumen semanal con meta de 42 sesiones (6 × 7 días) en la vista agregada.

Gráficas implementadas en el periodo visible:

- Cumplimiento promedio por periodo.
- Volumen máximo y promedio frente a la meta del nivel activo.
- Sesiones con sensor frente a la meta esperada (diaria o semanal según la vista).
- Distribución de calidad de sesiones (perfectas, interrumpidas, completadas no perfectas, otras/incompletas).

---

## Criterios de inclusión de sesiones

Para evitar mezclar datos de práctica o simulación con el seguimiento estructurado, el código **filtra** las sesiones antes de calcular métricas. Se incluyen sesiones que cumplen simultáneamente (función `isClinicalSensorSession` en `src/utils/sessionClassification.ts`):

- `input_mode === 'sensor'`
- `data_source === 'sensor_model'`
- `is_practice_session === false`
- `official_validation_source === 'sensor_model'`

Se **excluyen** explícitamente las sesiones de práctica (p. ej. `is_practice_session === true`, `input_mode === 'touch_practice'`, `data_source === 'touch_simulation'`).

Esta clasificación es una **regla técnica de filtrado de datos exportados** definida en el proyecto académico. **No equivale** a validación clínica formal, certificación del dispositivo ni homologación de un flujo asistencial regulado.

Las sesiones no clasificadas o excluidas no alimentan los indicadores principales del dashboard.

---

## Instalación y ejecución

### Requisitos previos

- **Node.js** y **npm** instalados en el sistema.
- Acceso al repositorio y permisos para instalar dependencias.

> **TODO: referencia pendiente** — Requisito mínimo de versión de Node.js (no declarado en `package.json`).

### Pasos

```bash
# Clonar o abrir el repositorio, luego:
npm install
npm run dev
```

Abra la URL que muestra Vite (por defecto `http://localhost:5173`), cargue un JSON exportado desde RESPIRA+ y revise el dashboard.

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Vite. |
| `npm run build` | Compila la aplicación para distribución estática (`tsc -b` + build de Vite). |
| `npm run preview` | Sirve localmente el resultado de `npm run build` para verificación. |
| `npm run lint` | Ejecuta ESLint sobre el código fuente. |

El comando `build` produce artefactos estáticos; **no implica** un despliegue clínico ni un entorno asistencial validado.

---

## Estructura del repositorio

```
respira-doctor-dashboard/
├── public/                 # Recursos estáticos (p. ej. iconos)
├── src/
│   ├── components/         # Interfaz: carga de archivos, dashboard, KPIs, tablas, gráficas
│   │   └── charts/       # Componentes de gráficas (vistas temporales)
│   ├── theme/            # Tokens de marca (RESPIRA+)
│   ├── types/            # Tipos TypeScript del export JSON y métricas
│   ├── utils/            # Validación, métricas, adherencia, clasificación de sesiones
│   ├── App.tsx           # Flujo principal: carga → dashboard
│   ├── main.tsx          # Punto de entrada React
│   ├── App.css
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── README.md
```

**Stack tecnológico** (según `package.json`): React 19, TypeScript, Vite 8, Recharts 3, ESLint.

---

## Variables de entorno

**No se requieren variables de entorno** para ejecutar el dashboard en su estado actual. El repositorio no incluye archivos `.env` ni referencias a `import.meta.env` en el código fuente.

---

## Estado de desarrollo y limitaciones conocidas

- Prototipo académico en evolución (`version: 0.0.0`).
- Funcionamiento previsto en **entorno local** (desarrollo o preview del build estático).
- Sin autenticación de usuarios ni control de acceso por rol.
- Sin sincronización en tiempo real con la app RESPIRA+; depende de exportaciones JSON manuales.
- Sin archivo JSON de ejemplo incluido para pruebas offline.
- Componentes de gráficas heredados presentes en el árbol de código pero **no conectados** al flujo principal actual; la documentación describe únicamente las vistas activas del dashboard.

---

## Pendientes y TODOs documentales

| Tema | Estado |
|------|--------|
| URL o referencia formal al repositorio/app RESPIRA+ | TODO: referencia pendiente |
| Archivo JSON de ejemplo anonimizado para pruebas | TODO: referencia pendiente |
| Compatibilidad exacta por `export_version` | TODO: referencia pendiente |
| Requisito mínimo de Node.js | TODO: referencia pendiente |
| Política de retención/eliminación de datos en uso real | TODO: referencia pendiente |

---

## Referencias

No se incluyen referencias bibliográficas en formato APA 7 en esta versión del README porque **no existen fuentes académicas internas documentadas** en este repositorio (p. ej. memoria, artículo o informe del proyecto con datos bibliográficos verificables).

> **TODO: referencia pendiente** — Incorporar referencias APA 7 cuando existan documentos internos del proyecto RESPIRA+ (institución, autores, año, título) disponibles para citar.

---

## Aviso final

RESPIRA+ · Doctor Dashboard es una herramienta de **visualización y apoyo a la revisión** de datos exportados. Cualquier decisión clínica debe basarse en la evaluación profesional integral del paciente y en la normativa sanitaria aplicable, no en los indicadores mostrados por este prototipo académico.
