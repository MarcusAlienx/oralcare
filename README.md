# A&E OralCare — Centro de Odontología Especializada

Arquitectura modernizada compatible con el protocolo MCP (Model Context Protocol). Monorepo fullstack con React + Vite, Express 5 y PostgreSQL.

---

## 1. Arquitectura y Flujo Lógico

El ecosistema está diseñado para una separación clara de responsabilidades, facilitando la integración con agentes de IA y el protocolo MCP.

```mermaid
graph TD
    A[Frontend: artifacts/oralcare] -->|Fetch /api/*| B[API Server: artifacts/api-server]
    B -->|Drizzle ORM| C[PostgreSQL]
    B -->|Google GenAI SDK| D[Gemini 2.0 Flash]
    E[Mockup Sandbox] -->|Preview| A
```

### Flujo de Datos
1. **Frontend**: Captura eventos (leads, visitas, chat) y los envía a la API usando hooks generados.
2. **API Server**: Valida requests con Zod, interactúa con la DB y gestiona el streaming de IA.
3. **MCP**: El archivo `mcp-config.json` habilita capacidades de lectura/escritura seguras para agentes en el directorio `./artifacts/`.

---

## 2. Autogestión por Agentes

Para validar cambios de forma autónoma usando el CLI de `insforge`:

1. **Validación de Tipos**:
   ```bash
   pnpm run typecheck
   ```
2. **Sincronización de Base de Datos**:
   ```bash
   pnpm --filter @workspace/db run push
   ```
3. **Generación de API**:
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```
4. **Pruebas de Salud**:
   ```bash
   curl http://localhost:8080/api/healthz
   ```

---

## 3. Despliegue y Validación Local

### Requisitos
- Node.js >= 24
- pnpm >= 10
- PostgreSQL corriendo localmente

### Configuración Local
1. Instalar dependencias: `pnpm install`
2. Configurar `.env` en `artifacts/api-server/`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/oralcare
   GEMINI_API_KEY=tu-api-key
   PORT=8080
   ```
3. Iniciar servicios:
   - Backend: `pnpm --filter @workspace/api-server run dev`
   - Frontend: `pnpm --filter @workspace/oralcare run dev`

### Validación de Servicios Externos
- **Gemini**: Enviar un mensaje via chat y verificar el streaming SSE.
- **Base de Datos**: Verificar que los leads se guarden correctamente en la tabla `leads`.
- **API Docs**: Acceder a `http://localhost:8080/api/docs` para ver la especificación interactiva.

---

## 4. Aseguramiento de Calidad (Husky)

El proyecto utiliza **Husky** para hooks de Git. 
- **Pre-commit**: Ejecuta `pnpm run build` automáticamente antes de cada commit para asegurar que no se introduzcan errores de compilación o tipos en el repositorio.

---

## 5. Estructura del Proyecto

- `artifacts/oralcare`: Aplicación principal (Frontend SPA).
- `artifacts/api-server`: Servidor de API Express.
- `artifacts/mockup-sandbox`: Entorno de desarrollo de componentes.
- `lib/db`: Schema y configuración de base de datos.
- `lib/api-spec`: Contrato OpenAPI y generador de clientes.
