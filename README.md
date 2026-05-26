# Respira+ Doctor Dashboard

Dashboard web clínico para visualizar exportaciones JSON de pacientes desde la app **Respira+**.

Todo el procesamiento ocurre **localmente en el navegador**: sin login, sin Supabase y sin backend.

## Inicio rápido

```bash
npm install
npm run dev
```

Abra la URL que muestra Vite (por defecto `http://localhost:5173`), suba un archivo `respira_export.json` exportado desde la app y revise el dashboard.

## Formato de exportación

El JSON debe incluir:

- `export_version`, `exported_at`
- `patient`, `diagnostics`, `patient_levels`, `sessions`
- Cada elemento de `sessions` con `session` y `attempts`

Compatible con la exportación clínica de Respira+ (v2.x).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run preview` | Vista previa del build |

## Privacidad

Los archivos del paciente **no se envían a ningún servidor**. La lectura usa `FileReader` y el análisis se hace en memoria en el cliente.
