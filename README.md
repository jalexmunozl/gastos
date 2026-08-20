# Gastos

Registro minimalista de gastos diarios, semanales y mensuales. Sin backend y sin base de datos: todo se guarda en el `localStorage` del navegador.

## Funcionalidades

- Añadir, editar y eliminar gastos (monto, categoría, nota y fecha).
- Vistas por período: diario, semanal y mensual, con navegación entre períodos.
- Resumen: total del período, promedio por día y comparación con el período anterior.
- Gráfico de evolución y desglose por categoría.
- Selector de moneda.
- Exportar a JSON/CSV e importar desde JSON (respaldo entre navegadores o dispositivos).

## Stack

Vite + React + TypeScript + Tailwind CSS + Recharts.

## Uso

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ (sitio estático)
npm run preview
npm run lint
```

El resultado de `npm run build` es un sitio estático que se puede publicar en Vercel, Netlify, GitHub Pages o cualquier hosting de archivos.

## Datos

Los gastos viven únicamente en el navegador (clave `gastos.expenses.v1`). Borrar los datos del sitio elimina el historial, por lo que conviene exportar un JSON de respaldo periódicamente.

> Nota: si `npm run lint` o `npm run build` fallan con "Cannot find native binding", es el bug conocido de npm con dependencias opcionales (npm/cli#4828): borra `node_modules` y `package-lock.json` y vuelve a ejecutar `npm install`.
