# Project Context

## Purpose
The primary objective is to develop a professional, multilingual (Arabic, French, English) corporate website for "**Aliyet**". The website aims to establish a strong online presence, showcasing expertise in industrial machine maintenance (corrective, preventive, specialized) and generating qualified leads for both maintenance services and new machine procurement. The target audience includes Factory Managers and Workshop Owners.

## Tech Stack
- **Framework**: Nuxt v4 (v4.2.1+)
- **UI Library**: Nuxt UI (built on Tailwind CSS and Reka UI)
- **Language**: JavaScript with JSDoc annotations
- **Package Manager**: pnpm
- **Backend**: Nuxt Server Routes (Nitro Engine) in `/server/api`
- **Database ORM**: Sequelize (configured for dev, prod, and test)
- **Testing**: Simple unit testing setup with mock database

## Project Conventions

### Code Style
- **Vue Syntax**: Modern Composition API with `<script setup>`.
- **Components**: Use `UFormField` instead of the deprecated/non-existent `UFormGroup`.
- **Imports**: Avoid explicit imports for compiler macros like `defineExpose` or `ref` (rely on Nuxt auto-imports) unless necessary.
- **General**: Write clean, readable, modern, and maintainable code. Reuse code whenever possible.

### Architecture Patterns
- **Structure**: Follows Nuxt v4 opinionated directory structure (`app/` for frontend, `server/` for backend).
- **Rendering**: Universal Rendering (SSR) is the default.
- **Routing**: File-based routing via `app/pages`.
- **API**: Backend logic resides in `server/api`, isolated from client-side code.
- **Database**: ORM migrations are **not** managed within this project.

### Testing Strategy
- Use `pnpm test` to run tests.
- Backend APIs are tested in isolation using a mock database.
- Focus on simple unit testing setups.

### Git Workflow
- Master branch is: `master`.

## Domain Context
- **Services**: Corrective Maintenance, Preventive Maintenance, Programming/Configuring, Hardware Maintenance, Hydraulic/Pneumatic Maintenance.
- **Products**: Industrial machines (Turning Centers, Machining Centers, EDM machines).
- **Business Model**: Aliyet acts as a **facilitator/broker** for machine procurement, not a direct seller.
- **Key Features**: "Build & Price" quote request system with a fixed workflow.

## Important Constraints
- **Language Restriction**: Must use JavaScript, not TypeScript.
- **Package Management**: Do not install new third-party libraries without permission. Use existing versions.
- **Database**: Do not create or manage ORM migrations.
- **Content**: All content must support three languages: Arabic, French, and English.

## External Dependencies
- **Google Maps**: Embedded on the Contact page.
- **Email Service**: For sending quote requests and contact form submissions (to `contact@aliyaat.com` and founders).
