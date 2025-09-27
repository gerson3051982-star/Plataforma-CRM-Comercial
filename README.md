# CRM colaborativo con Next.js y PostgreSQL

Esta herramienta permite a equipos de hasta 500 personas gestionar 5 000 contactos, 30 oportunidades activas y cientos de interacciones comerciales sin perder contexto. Se construyó sobre Next.js (App Router), Tailwind CSS 4 y Prisma para PostgreSQL.

## Características principales

- **Gestión de contactos:** búsqueda por nombre, empresa o etiqueta; agrupación por ciudad, empresa o tag; creación/edición/eliminación con asignación a responsables y notas contextuales.
- **Pipeline visual:** tablero tipo kanban por estado (nuevo, en progreso, ganado, perdido) con ficha editable y resumen de valor monetario por columna.
- **Registro de actividades:** llamadas, correos, reuniones y tareas vinculadas a contactos u oportunidades, filtrables por tipo y rango de fechas.
- **Autenticación y perfiles:** registro de usuarios, inicio/cierre de sesión con contraseña cifrada y sesiones almacenadas en PostgreSQL.
- **Semillas masivas:** script para poblar 500 miembros de equipo, 150 compañías aproximadas, 5 000 contactos, 30 oportunidades y ~800 actividades con datos sintéticos mediante Faker (incluye un administrador por defecto).
- **Interfaz responsiva:** navegación lateral fija, encabezados contextuales y tarjetas que resaltan métricas clave. Se incluyen recursos visuales (por ejemplo `public/hero-grid.svg`) para reforzar la narrativa del dashboard.

## Requisitos previos

- Node.js ≥ 18
- PostgreSQL ≥ 14
- Variables de entorno definidas en `.env` (`DATABASE_URL`, `NEXTAUTH_SECRET`, variables opcionales de seed)

## Puesta en marcha

1. **Instala dependencias**
   ```bash
   npm install
   ```
2. **Configura la base de datos y secretos**
   - Actualiza `DATABASE_URL` con tu instancia de PostgreSQL.
   - Define `NEXTAUTH_SECRET` (puedes generar uno con `openssl rand -base64 32`).
3. **Genera/esquema y ejecuta migraciones**
   ```bash
   npx prisma migrate dev --name init
   ```
4. **(Opcional) Carga datos de ejemplo**
   ```bash
   npm run seed
   ```
   Puedes ajustar el tamaño con variables como `SEED_CONTACT_SIZE`, `SEED_TEAM_SIZE`, etc. antes de ejecutar el comando. El seed crea una cuenta administradora (`admin@crm.local` / `Cambiar123!`).
5. **Arranca el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Estructura destacada

```
src/
├─ actions/           # Server Actions (contactos, oportunidades, actividades, auth)
├─ app/
│  ├─ (auth)/         # Páginas públicas (login, registro)
│  └─ (app)/          # Rutas protegidas por sesión (dashboard, contactos, pipeline, actividades)
├─ components/        # Componentes UI reutilizables (formularios, tarjetas, layouts, auth)
├─ generated/prisma/  # Cliente Prisma generado automáticamente
├─ lib/               # Prisma client, consultas agregadas, configuración de NextAuth
├─ types/             # Extensiones de tipos (NextAuth)
└─ app/globals.css    # Estilos globales con Tailwind v4
```

## Comandos útiles

- `npm run lint`: valida las reglas de ESLint (se ignoran los artefactos generados en `src/generated`).
- `npm run seed`: ejecuta `prisma db seed` usando `tsx` y Faker.
- `npx prisma studio`: abre Prisma Studio para explorar y editar datos.

## Personalización

- Añade miembros de equipo predefinidos creando registros en `TeamMember` (p. ej. durante el seed o desde Prisma Studio).
- Amplía el pipeline agregando estados extra en el enum `OpportunityStatus` del esquema y reflejándolo en la UI.
- Ajusta la paleta visual desde `globals.css` o actualiza los componentes para soportar dark mode.

## Licencia

Proyecto base generado con Create Next App. Ajusta las licencias según el destino del proyecto.
