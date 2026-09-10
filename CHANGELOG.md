# Changelog

## [0.2.0] — 2026-09-09

- Accesos de clientes: desde cada empresa (Clientes → Accesos portal) → portal `/portal`
- Registro por escaneo de papel (foto/PDF) además del formulario digital
- Admin: eliminar tenant (cascade de datos + uploads)
- Primer ingreso: forzar cambio de la contraseña temporal del owner creado por admin
  (los accesos de cliente usan la clave que define el owner)
- Categorías de registro (capacitaciones, estudios, inspecciones, EPP, mediciones)
- Charla de 5 minutos como template de Capacitaciones
- Alta de registro desde planta + listado filtrable en /app/registros (categoría + cliente)
- Flujo templates desde imagen/PDF → schema borrador → listo
- Marca (logo) y exportación/impresión de registros con branding
- Firma táctil con el dedo en registros de planta
- Login en `/`; menú de cuenta (marca + accesos)

## [0.1.0] — 2026-09-09

- App Next.js 15 + TypeScript + Tailwind (CaldenIA)
- Login unificado (plataforma / estudio) y panel admin de tenants
- Clientes y plantas por profesional, dashboard con conteos
- Identidad HSE (oscuro + señal lima), layout móvil y desktop
- Schema Prisma multi-tenant, scripts `db:*`
