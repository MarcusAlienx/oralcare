import { createClient } from "npm:@insforge/sdk";

const INSFORGE_BASE_URL = Deno.env.get("INSFORGE_BASE_URL");
// Prefer a server/service key for server-side AI & DB operations. Fall back to anon if necessary (not recommended).
const INSFORGE_SERVICE_KEY = Deno.env.get("INSFORGE_SERVICE_KEY") || Deno.env.get("INSFORGE_API_KEY") || Deno.env.get("INSFORGE_ANON_KEY");

// Local admin auth configuration.
const JWT_SECRET = Deno.env.get("JWT_SECRET") || null;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || null;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || null;

// Optional: direct Google Gemini API key. If provided, the function will call
// the Google Generative Language API directly instead of using the InsForge AI SDK.
const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY") || null;

if (!INSFORGE_BASE_URL) {
  throw new Error("INSFORGE_BASE_URL must be set in function environment.");
}

if (!INSFORGE_SERVICE_KEY) {
  throw new Error("INSFORGE_SERVICE_KEY or INSFORGE_API_KEY (or INSFORGE_ANON_KEY) must be set in function environment.");
}

const client = createClient({
  baseUrl: INSFORGE_BASE_URL,
  anonKey: INSFORGE_SERVICE_KEY,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PATCH,DELETE",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

const jsonHeaders = {
  "Content-Type": "application/json",
  ...corsHeaders,
};

const eventStreamHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  ...corsHeaders,
};

const parseRoute = (route: string | null, pathname: string) => {
  const raw = route || pathname;
  const segments = raw.split("/").filter(Boolean);
  if (segments[0] === "api") {
    segments.shift();
  }
  return segments;
};

const createError = (status: number, message: string) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: jsonHeaders,
  });

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const base64UrlEncode = (array: Uint8Array) =>
  btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const base64UrlDecode = (value: string) => {
  const pad = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

async function createHmac(key: string, payload: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  return new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload))
  );
}

async function signJwt(payload: Record<string, unknown>) {
  if (!JWT_SECRET) {
    throw new Error("Server JWT_SECRET is not configured.");
  }

  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64UrlEncode(
    encoder.encode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }))
  );
  const signature = await createHmac(JWT_SECRET, `${header}.${body}`);

  return `${header}.${body}.${base64UrlEncode(signature)}`;
}

async function verifyJwt(token: string) {
  if (!JWT_SECRET) {
    throw new Error("Server JWT_SECRET is not configured.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Invalid token format.");
  }

  const signature = base64UrlDecode(encodedSignature);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const verified = await crypto.subtle.verify(
    "HMAC",
    cryptoKey,
    signature,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  );

  if (!verified) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(decoder.decode(base64UrlDecode(encodedPayload)));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now >= payload.exp) {
    throw new Error("Token expired.");
  }
  return payload;
}

async function requireAdminAuth(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw createError(401, "Authentication required");
  }
  const token = authorization.slice(7);
  try {
    const payload = await verifyJwt(token);
    if (payload.role !== "admin" || payload.email !== ADMIN_EMAIL) {
      throw createError(403, "Unauthorized");
    }
    return payload;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw createError(401, "Invalid authentication token");
  }
}

function validateAdminCredentials(email: string, password: string) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured.");
  }
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}



// Route Handlers

async function handleHealthz(req: Request, segments: string[], method: string): Promise<Response> {
  if (method === "GET") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  }
  return createError(405, "Method not allowed");
}

async function handleOpenAI(req: Request, segments: string[], method: string): Promise<Response> {
  // Debugging helper: call /api?route=debug/db to test DB connectivity and return error details
  if (segments[1] === "debug" && segments[2] === "db") {
    try {
      const { data, error } = await client.database.from("conversations").select().limit(1);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, rows: data ?? [] }), { status: 200, headers: jsonHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ ok: false, error: err?.message ?? String(err) }), { status: 500, headers: jsonHeaders });
    }
  }

  if (segments[1] === "conversations") {
    const conversationId = segments[2] ? Number(segments[2]) : null;
    const isMessagesRoute = segments[3] === "messages";

    if (!conversationId && segments.length === 2 && method === "GET") {
      const { data, error } = await client.database.from("conversations").select();
      if (error) throw error;
      return new Response(JSON.stringify(data ?? []), { status: 200, headers: jsonHeaders });
    }

    if (!conversationId && segments.length === 2 && method === "POST") {
      const body = await req.json();
      if (!body?.title) {
        return createError(400, "title is required");
      }
      try {
        const { data, error } = await client.database.from("conversations").insert([{ title: body.title }]).select();
        if (error) throw error;
        return new Response(JSON.stringify(data?.[0] ?? null), { status: 201, headers: jsonHeaders });
      } catch (insertErr) {
        // Fallback: try direct PostgREST insert using API_KEY if available
        const RAW_API_KEY = Deno.env.get("API_KEY") || Deno.env.get("INSFORGE_API_KEY");
        if (RAW_API_KEY) {
          try {
            const postgrestUrl = INSFORGE_BASE_URL.replace(/\/$/, "") + "/rest/v1/conversations";
            const r = await fetch(postgrestUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: RAW_API_KEY,
                Authorization: `Bearer ${RAW_API_KEY}`,
              },
              body: JSON.stringify([{ title: body.title }]),
            });
            if (!r.ok) {
              const txt = await r.text();
              throw new Error(`PostgREST fallback failed: ${r.status} ${txt}`);
            }
            const j = await r.json();
            return new Response(JSON.stringify(j?.[0] ?? null), { status: 201, headers: jsonHeaders });
          } catch (fbErr) {
            console.error("PostgREST fallback error:", fbErr);
            throw insertErr;
          }
        }
        throw insertErr;
      }
    }

    if (conversationId && segments.length === 3 && method === "GET") {
      const { data: conversations, error: convError } = await client.database.from("conversations").select().eq("id", conversationId);
      if (convError) throw convError;
      const conversation = conversations?.[0] ?? null;
      if (!conversation) {
        return createError(404, "Conversation not found");
      }
      const { data: msgs, error: msgError } = await client.database.from("messages").select().eq("conversation_id", conversationId);
      if (msgError) throw msgError;
      return new Response(JSON.stringify({ ...conversation, messages: msgs ?? [] }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    if (conversationId && segments.length === 3 && method === "DELETE") {
      const { data: existing, error: existingError } = await client.database.from("conversations").select().eq("id", conversationId);
      if (existingError) throw existingError;
      if (!existing?.length) {
        return createError(404, "Conversation not found");
      }
      const { error } = await client.database.from("conversations").delete().eq("id", conversationId);
      if (error) throw error;
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (conversationId && isMessagesRoute) {
      if (method === "GET") {
        const { data, error } = await client.database.from("messages").select().eq("conversation_id", conversationId);
        if (error) throw error;
        return new Response(JSON.stringify(data ?? []), { status: 200, headers: jsonHeaders });
      }

      if (method === "POST") {
        const body = await req.json();
        if (!body?.content) {
          return createError(400, "content is required");
        }

        const { data: previousMessages, error: prevError } = await client.database.from("messages").select().eq("conversation_id", conversationId);
        if (prevError) throw prevError;

        const chatMessages = (previousMessages ?? []).map((m: any) => ({
          role: m.role,
          content: m.content,
        }));

        const systemMessage = {
          role: "system",
          content: `Eres la asistente dental de A&E OralCare en Zapopan, Guadalajara. Eres directa, cálida y eficiente — tu objetivo es agendar citas.

REGLAS:
- Respuestas máximo 2-3 oraciones. Sin listas largas.
- Siempre dirige al paciente a agendar: llamar al (33) 3915.3838 o WhatsApp.
- Si preguntan precio, di que depende de la evaluación y ofrece una valoración SIN COSTO.
- No repitas información que ya dijiste en el chat.

SERVICIOS: Ortodoncia (brackets/Invisalign), Implantes, Endodoncia, Carillas, Blanqueamiento, Odontopediatría, Rehabilitación Oral.
HORARIO: Lun-Vie 9-19h, Sáb 9-14h.
UBICACIÓN: Av. Guadalupe 5787, Zapopan.
`,
        };

        // If a direct Google Gemini API key is configured, call the Google
        // Generative Language API directly (non-streaming fallback) and
        // stream the single result back to the client. Otherwise use the
        // InsForge SDK streaming API as before.
        const encoder = new TextEncoder();
        let fullResponse = "";

        if (GOOGLE_GEMINI_API_KEY) {
          // Call Google Generative Language API (generateContent endpoint)
          try {
            const gResp = await fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-goog-api-key": GOOGLE_GEMINI_API_KEY,
                },
                body: JSON.stringify({
                  // The simple request uses `contents` with a single part
                  contents: [
                    { parts: [{ text: systemMessage.content }] },
                    ...chatMessages.map((m: any) => ({ parts: [{ text: m.content }] })),
                    { parts: [{ text: body.content }] },
                  ],
                }),
              }
            );

            if (!gResp.ok) {
              const errText = await gResp.text();
              throw new Error(`Gemini request failed: ${gResp.status} ${errText}`);
            }

            const gjson = await gResp.json();

            // Best-effort extraction of text from response shape
            const candidate = gjson?.candidates?.[0] ?? null;
            if (candidate && Array.isArray(candidate.content)) {
              for (const part of candidate.content) {
                if (part?.text) fullResponse += part.text;
              }
            } else if (typeof gjson?.output === "string") {
              fullResponse = gjson.output;
            } else if (Array.isArray(gjson?.output) && typeof gjson.output[0]?.content === "string") {
              fullResponse = gjson.output[0].content;
            } else {
              // Fallback: stringify the response
              fullResponse = JSON.stringify(gjson);
            }

            const readableStream = new ReadableStream({
              pull(controller) {
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ content: fullResponse }) + "\n\n"));
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true }) + "\n\n"));
                controller.close();
              },
            });

            // Persist assistant message
            try {
              await client.database.from("messages").insert([{
                conversation_id: conversationId,
                role: "assistant",
                content: fullResponse,
              }]);
            } catch (dbErr) {
              console.error("Failed to persist assistant message:", dbErr);
            }

            const response = new Response(readableStream, {
              headers: eventStreamHeaders,
            });

            response.headers.set("x-accumulate-response", "true");
            return response;
          } catch (gErr) {
            console.error("Gemini request error:", gErr);
            return createError(502, "Gemini request failed");
          }
        } else {
          // Existing InsForge SDK streaming path
          const stream = await client.ai.chat.completions.create({
            model: "google/gemini-2.5-flash-lite",
            messages: [systemMessage, ...chatMessages, { role: "user", content: body.content }],
            maxTokens: 1024,
            stream: true,
          });

          const readableStream = new ReadableStream({
            async pull(controller) {
              try {
                for await (const chunk of stream) {
                  const content = chunk.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode("data: " + JSON.stringify({ content }) + "\n\n"));
                  }
                }

                // signal end of stream to client
                controller.enqueue(encoder.encode("data: " + JSON.stringify({ done: true }) + "\n\n"));

                // Persist the accumulated assistant response after streaming completes
                try {
                  await client.database.from("messages").insert([{ 
                    conversation_id: conversationId,
                    role: "assistant",
                    content: fullResponse,
                  }]);
                } catch (dbErr) {
                  console.error("Failed to persist assistant message:", dbErr);
                }

                controller.close();
              } catch (err) {
                controller.error(err);
              }
            },
          });

          const response = new Response(readableStream, {
            headers: eventStreamHeaders,
          });

          response.headers.set("x-accumulate-response", "true");

          return response;
        }
      }
    }
  }

  return createError(404, "Route not found");
}

async function handleLeads(req: Request, segments: string[], method: string): Promise<Response> {
  const leadId = segments[1] ? Number(segments[1]) : null;

  if (!leadId && method === "GET") {
    const { data, error } = await client.database.from("leads").select();
    if (error) throw error;
    return new Response(JSON.stringify(data ?? []), { status: 200, headers: jsonHeaders });
  }

  if (!leadId && method === "POST") {
    const body = await req.json();
    const { data, error } = await client.database.from("leads").insert([{
      name: body.name,
      email: body.email ?? null,
      phone: body.phone,
      service: body.service ?? null,
      message: body.message ?? null,
      status: "nuevo",
    }]).select();
    if (error) throw error;
    return new Response(JSON.stringify(data?.[0] ?? null), { status: 201, headers: jsonHeaders });
  }

  if (leadId && method === "PATCH") {
    await requireAdminAuth(req);
    const body = await req.json();
    const { data, error } = await client.database.from("leads").update({ status: body.status }).eq("id", leadId).select();
    if (error) throw error;
    if (!data?.length) return createError(404, "Lead not found");
    return new Response(JSON.stringify(data[0]), { status: 200, headers: jsonHeaders });
  }

  return createError(404, "Route not found");
}

async function handleAuth(req: Request, segments: string[], method: string): Promise<Response> {
  if (segments[1] === "login" && method === "POST") {
    const body = await req.json();
    if (!body?.email || !body?.password) {
      return createError(400, "email and password are required");
    }
    if (!validateAdminCredentials(body.email, body.password)) {
      return createError(401, "Invalid credentials");
    }
    const token = await signJwt({ role: "admin", email: body.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 });
    return new Response(JSON.stringify({ token }), { status: 200, headers: jsonHeaders });
  }

  if (segments[1] === "me" && method === "GET") {
    await requireAdminAuth(req);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });
  }

  return createError(404, "Route not found");
}

async function handlePatients(req: Request, segments: string[], method: string): Promise<Response> {
  await requireAdminAuth(req);
  const patientId = segments[1] ? Number(segments[1]) : null;

  if (!patientId && method === "GET") {
    const { data, error } = await client.database.from("patients").select().order("created_at", { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data ?? []), { status: 200, headers: jsonHeaders });
  }

  if (!patientId && method === "POST") {
    const body = await req.json();
    const { data, error } = await client.database.from("patients").insert([{
      name: body.name,
      email: body.email ?? null,
      phone: body.phone,
      notes: body.notes ?? null,
    }]).select();
    if (error) throw error;
    return new Response(JSON.stringify(data?.[0] ?? null), { status: 201, headers: jsonHeaders });
  }

  if (patientId && method === "GET") {
    const { data, error } = await client.database.from("patients").select().eq("id", patientId).limit(1);
    if (error) throw error;
    const patient = data?.[0] ?? null;
    if (!patient) return createError(404, "Patient not found");
    return new Response(JSON.stringify(patient), { status: 200, headers: jsonHeaders });
  }

  if (patientId && method === "PATCH") {
    const body = await req.json();
    const { data, error } = await client.database.from("patients").update({
      name: body.name,
      email: body.email ?? null,
      phone: body.phone,
      notes: body.notes ?? null,
    }).eq("id", patientId).select();
    if (error) throw error;
    if (!data?.length) return createError(404, "Patient not found");
    return new Response(JSON.stringify(data[0]), { status: 200, headers: jsonHeaders });
  }

  return createError(404, "Route not found");
}

async function handleAppointments(req: Request, segments: string[], method: string): Promise<Response> {
  await requireAdminAuth(req);
  const appointmentId = segments[1] ? Number(segments[1]) : null;

  if (!appointmentId && method === "GET") {
    const { data, error } = await client.database.from("appointments").select().order("scheduled_at", { ascending: true });
    if (error) throw error;
    return new Response(JSON.stringify(data ?? []), { status: 200, headers: jsonHeaders });
  }

  if (!appointmentId && method === "POST") {
    const body = await req.json();
    const { data, error } = await client.database.from("appointments").insert([{
      patient_id: body.patientId,
      service: body.service ?? null,
      scheduled_at: body.scheduledAt,
      status: body.status ?? "scheduled",
      notes: body.notes ?? null,
    }]).select();
    if (error) throw error;
    return new Response(JSON.stringify(data?.[0] ?? null), { status: 201, headers: jsonHeaders });
  }

  if (appointmentId && method === "GET") {
    const { data, error } = await client.database.from("appointments").select().eq("id", appointmentId).limit(1);
    if (error) throw error;
    const appointment = data?.[0] ?? null;
    if (!appointment) return createError(404, "Appointment not found");
    return new Response(JSON.stringify(appointment), { status: 200, headers: jsonHeaders });
  }

  if (appointmentId && method === "PATCH") {
    const body = await req.json();
    const { data, error } = await client.database.from("appointments").update({
      service: body.service ?? null,
      scheduled_at: body.scheduledAt ?? null,
      status: body.status ?? null,
      notes: body.notes ?? null,
    }).eq("id", appointmentId).select();
    if (error) throw error;
    if (!data?.length) return createError(404, "Appointment not found");
    return new Response(JSON.stringify(data[0]), { status: 200, headers: jsonHeaders });
  }

  return createError(404, "Route not found");
}

async function handleAdmin(req: Request, segments: string[], method: string): Promise<Response> {
  if (segments[1] === "stats" && method === "GET") {
    await requireAdminAuth(req);

    const { data: leads, error: leadsError } = await client.database.from("leads").select();
    if (leadsError) throw leadsError;
    const { data: visits, error: visitsError } = await client.database.from("page_visits").select();
    if (visitsError) throw visitsError;
    const { data: conversations, error: convError } = await client.database.from("conversations").select();
    if (convError) throw convError;
    const { data: patients, error: patientsError } = await client.database.from("patients").select();
    if (patientsError) throw patientsError;
    const { data: appointments, error: appointmentsError } = await client.database.from("appointments").select();
    if (appointmentsError) throw appointmentsError;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newLeadsToday = (leads ?? []).filter((lead: any) => new Date(lead.created_at) >= todayStart).length;
    const visitsToday = (visits ?? []).filter((visit: any) => new Date(visit.created_at) >= todayStart).length;
    const totalLeads = (leads ?? []).length;
    const totalConversations = (conversations ?? []).length;
    const conversionRate = totalLeads > 0 ? Math.round((totalConversations / totalLeads) * 100) : 0;
    const upcomingAppointments = (appointments ?? []).filter((appointment: any) => new Date(appointment.scheduled_at) >= new Date()).length;
    const completedAppointments = (appointments ?? []).filter((appointment: any) => appointment.status === "completed").length;
    const canceledAppointments = (appointments ?? []).filter((appointment: any) => appointment.status === "canceled").length;

    const leadsByService: Array<{ service: string; count: number }> = [];
    const leadsByStatus: Array<{ status: string; count: number }> = [];
    const serviceMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};

    for (const lead of leads ?? []) {
      const svc = lead.service ?? "Sin especificar";
      serviceMap[svc] = (serviceMap[svc] ?? 0) + 1;
      statusMap[lead.status] = (statusMap[lead.status] ?? 0) + 1;
    }

    for (const [service, count] of Object.entries(serviceMap)) {
      leadsByService.push({ service, count });
    }
    for (const [status, count] of Object.entries(statusMap)) {
      leadsByStatus.push({ status, count });
    }

    const visitsLast7DaysMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const key = day.toISOString().slice(0, 10);
      visitsLast7DaysMap[key] = 0;
    }

    for (const visit of visits ?? []) {
      const dateKey = new Date(visit.created_at).toISOString().slice(0, 10);
      if (Object.prototype.hasOwnProperty.call(visitsLast7DaysMap, dateKey)) {
        visitsLast7DaysMap[dateKey] += 1;
      }
    }

    return new Response(JSON.stringify({
      totalLeads,
      newLeadsToday,
      totalVisits: (visits ?? []).length,
      visitsToday,
      totalConversations,
      conversionRate,
      totalPatients: (patients ?? []).length,
      upcomingAppointments,
      completedAppointments,
      canceledAppointments,
      leadsByService,
      leadsByStatus,
      recentLeads: (leads ?? []).slice(-10).reverse(),
      recentPatients: (patients ?? []).slice(-10).reverse(),
      recentAppointments: (appointments ?? []).slice(-10).reverse(),
      visitsLast7Days: Object.entries(visitsLast7DaysMap).map(([date, count]) => ({ date, count })),
    }), { status: 200, headers: jsonHeaders });
  }

  if (segments[1] === "track-visit" && method === "POST") {
    const body = await req.json();
    await client.database.from("page_visits").insert({
      page: body.page,
      referrer: body.referrer ?? null,
      user_agent: body.userAgent ?? null,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });
  }

  return createError(404, "Route not found");
}

export default async function (req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method.toUpperCase() === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const route = url.searchParams.get("route");
  const segments = parseRoute(route, url.pathname);

  if (!segments || segments.length === 0) {
    return createError(400, "Missing route parameter");
  }

  const method = req.method.toUpperCase();

  try {
    switch (segments[0]) {
      case "healthz":
        return await handleHealthz(req, segments, method);
      case "openai":
        return await handleOpenAI(req, segments, method);
      case "leads":
        return await handleLeads(req, segments, method);
      case "auth":
        return await handleAuth(req, segments, method);
      case "patients":
        return await handlePatients(req, segments, method);
      case "appointments":
        return await handleAppointments(req, segments, method);
      case "admin":
        return await handleAdmin(req, segments, method);
      default:
        return createError(404, "Route not found");
    }
  } catch (error: any) {
    console.error(error);
    if (error?.message?.includes("429")) {
      return createError(429, "Rate limit exceeded");
    }
    // Temporary: return the actual error message to aid debugging (remove in production)
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), { status: 500, headers: jsonHeaders });
  }
}
