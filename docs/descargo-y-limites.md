# Descargo de responsabilidad y límites — RESPIRA+ · Doctor Dashboard

Este documento define el **alcance**, las **limitaciones** y las **responsabilidades** asociadas al uso del RESPIRA+ · Doctor Dashboard. Debe leerse junto con el [README principal](../README.md).

---

## Naturaleza del artefacto

RESPIRA+ · Doctor Dashboard es un **prototipo académico** y una **herramienta web de apoyo** para:

- **Visualizar** datos contenidos en exportaciones JSON generadas por la aplicación móvil RESPIRA+.
- **Facilitar la revisión estructurada** de indicadores de seguimiento (adherencia, sesiones con sensor, volúmenes, evolución temporal).
- **Apoyar** al profesional de la salud en la consulta de información ya registrada por el paciente en la app.

No es un producto sanitario terminado, un expediente clínico electrónico regulado ni un sistema de información hospitalario.

| Aspecto | Estado documentado en el repositorio |
|---------|--------------------------------------|
| Versión del paquete | `0.0.0` |
| Backend / API | No implementado |
| Autenticación | No implementada |
| Almacenamiento en servidor | No implementado |
| Despliegue clínico | No documentado |
| Registro sanitario / COFEPRIS | No documentado en este repositorio |
| Validación clínica formal | No documentada en este repositorio |

---

## Lo que la herramienta no hace

El dashboard **no**:

1. **Diagnostica** enfermedades ni condiciones médicas.
2. **Prescribe** tratamientos, dosis ni modificaciones del plan terapéutico en RESPIRA+.
3. **Sustituye** la evaluación, el criterio ni la responsabilidad del profesional de la salud.
4. **Certifica** evolución clínica, alta médica ni aptitud para actividades.
5. **Garantiza** la exactitud clínica de los datos exportados; reproduce y resume lo contenido en el JSON.
6. **Toma decisiones clínicas autónomas**; los textos interpretativos de adherencia son reglas programadas orientativas.

---

## Visualización vs seguimiento vs decisión clínica

| Nivel | Qué implica en este dashboard |
|-------|--------------------------------|
| **Visualización de datos** | Mostrar gráficas, tablas y KPIs derivados del JSON cargado. |
| **Apoyo al seguimiento** | Organizar adherencia, sesiones y evolución para facilitar la revisión profesional. |
| **Decisión clínica** | **Queda fuera del alcance** del software; corresponde al profesional con base en evaluación integral y normativa aplicable. |

---

## Filtrado de sesiones (aclaración terminológica)

El código distingue sesiones incluidas para métricas (sensor, `sensor_model`, no práctica) de sesiones excluidas. Esa distinción es una **regla técnica de filtrado** definida en el proyecto académico.

**No debe interpretarse** como:

- Validación clínica formal del dispositivo o del flujo asistencial.
- Homologación ante autoridad regulatoria.
- Certificación de que una sesión es «clínicamente válida» en sentido normativo.

Detalle técnico: [metricas-y-vistas.md](./metricas-y-vistas.md).

---

## Privacidad y procesamiento local

Según el código actual:

- El archivo JSON se lee **solo en el navegador** del usuario (`FileReader`).
- **No se envía** a servidores como parte del flujo implementado en este repositorio.
- No hay integración con Supabase, bases de datos remotas ni servicios de login.
- Al recargar o cerrar la página, los datos dejan de mostrarse; **no hay persistencia en servidor**.

### Responsabilidades del operador

Quien utilice el dashboard es responsable de:

- La **custodia** del archivo exportado antes y después de cargarlo.
- Cualquier **transmisión** del JSON fuera del navegador (correo, USB, nube, etc.).
- Cumplir la **normativa de protección de datos personales** aplicable en su contexto (p. ej. datos de salud).
- La **eliminación segura** de copias locales cuando corresponda.

> **TODO: referencia pendiente** — Política formal de retención o eliminación de datos para uso en entorno clínico real.

---

## Eficacia y evidencia

Este repositorio **no documenta** estudios de eficacia, ensayos clínicos ni resultados de validación que demuestren impacto en outcomes postoperatorios. Las métricas mostradas son **indicadores derivados de datos de entrenamiento registrados en la app**, no evidencia de resultado clínico.

---

## Uso en entorno académico vs entorno asistencial real

El diseño actual (local, sin autenticación, sin trazabilidad de acceso) es coherente con un **prototipo de demostración y desarrollo académico**. Cualquier uso en entorno asistencial real requeriría análisis adicional de seguridad, gobernanza de datos, consentimiento informado y cumplimiento normativo que **no están cubiertos** por esta documentación.

---

## Relación con RESPIRA+

El dashboard complementa la app móvil RESPIRA+, orientada al seguimiento de pacientes adultos en contexto **postoperatorio** con ejercicios respiratorios y espirómetro incentivador, según el contexto descrito en el README principal.

> **TODO: referencia pendiente** — URL o referencia formal al repositorio o documentación de la aplicación móvil RESPIRA+.

Este repositorio **no incluye** el código de la app móvil.

---

## Aviso final

El uso del RESPIRA+ · Doctor Dashboard implica aceptar que se trata de una herramienta de **visualización y apoyo a la revisión** de datos exportados. Toda decisión clínica debe basarse en la evaluación profesional del paciente y en la normativa sanitaria vigente, no en los indicadores mostrados por este prototipo académico.
