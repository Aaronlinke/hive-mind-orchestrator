// 🚪 Security Guard - Der "Türsteher-Bot" für alle Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface SecurityContext {
  user: {
    id: string;
    email?: string;
    roles: string[];
  };
  supabase: any;
  request: Request;
}

export interface ValidationSchema {
  [key: string]: {
    type: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 🛡️ Hauptfunktion: Authentifiziere und autorisiere User
export async function authenticateRequest(
  req: Request,
  options: { requireAuth?: boolean; requiredRole?: string } = {}
): Promise<SecurityContext> {
  const { requireAuth = true, requiredRole } = options;

  // 1. Extrahiere Authorization Header
  const authHeader = req.headers.get("Authorization");
  
  if (requireAuth && !authHeader) {
    throw new SecurityError("Keine Authentifizierung bereitgestellt", 401);
  }

  // 2. Erstelle Supabase Client mit User-Kontext
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  // 3. Validiere User
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (requireAuth && (error || !user)) {
    throw new SecurityError("Ungültiges oder abgelaufenes Token", 401);
  }

  if (!user) {
    // Anonymous access erlaubt
    return {
      user: { id: "anonymous", roles: [] },
      supabase,
      request: req,
    };
  }

  // 4. Lade Benutzerrollen
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user!.id);

  const userRoles = roles?.map((r: any) => r.role) || [];

  // 5. Prüfe erforderliche Rolle
  if (requiredRole && !userRoles.includes(requiredRole) && !userRoles.includes("admin")) {
    throw new SecurityError(`Berechtigung '${requiredRole}' erforderlich`, 403);
  }

  // 6. Erstelle Audit-Log
  await createAuditLog(supabase, user!.id, "api_access", {
    endpoint: new URL(req.url).pathname,
    method: req.method,
    success: true,
  }, req);

  return {
    user: {
      id: user!.id,
      email: user!.email,
      roles: userRoles,
    },
    supabase,
    request: req,
  };
}

// ✅ Validiere Request Body
export async function validateRequestBody<T>(
  req: Request,
  schema: ValidationSchema
): Promise<T> {
  let body: any;
  
  try {
    body = await req.json();
  } catch {
    throw new SecurityError("Ungültiger JSON im Request Body", 400);
  }

  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} ist erforderlich`);
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} muss vom Typ ${rules.type} sein`);
    }

    // String validations
    if (rules.type === "string" && typeof value === "string") {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} muss mindestens ${rules.minLength} Zeichen lang sein`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} darf maximal ${rules.maxLength} Zeichen lang sein`);
      }
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors.push(`${field} hat ein ungültiges Format`);
      }
    }

    // Number validations
    if (rules.type === "number" && typeof value === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} muss mindestens ${rules.min} sein`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} darf maximal ${rules.max} sein`);
      }
    }
  }

  if (errors.length > 0) {
    throw new SecurityError(`Validierungsfehler: ${errors.join(", ")}`, 400);
  }

  return body as T;
}

// ⏱️ Rate Limiting prüfen
export async function checkRateLimit(
  supabase: any,
  userId: string,
  resource: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<void> {
  const { data: logs } = await supabase
    .from("security_audit_log")
    .select("created_at")
    .eq("user_id", userId)
    .eq("resource", resource)
    .gte("created_at", new Date(Date.now() - windowMs).toISOString());

  const requestCount = logs?.length || 0;

  if (requestCount >= maxRequests) {
    throw new SecurityError(
      `Rate-Limit überschritten. Maximal ${maxRequests} Anfragen pro ${windowMs / 1000} Sekunden`,
      429
    );
  }
}

// 📝 Audit-Log erstellen
export async function createAuditLog(
  supabase: any,
  userId: string | null,
  action: string,
  details: any,
  req: Request
): Promise<void> {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for") || 
             req.headers.get("x-real-ip") || 
             "unknown";

  await supabase.from("security_audit_log").insert({
    user_id: userId,
    action,
    resource: details.endpoint || "unknown",
    details,
    ip_address: ip,
    user_agent: userAgent,
    success: details.success !== false,
  });
}

// 🔒 Custom Security Error
export class SecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

// 🛡️ Error Handler Wrapper
export function handleSecurityError(error: unknown): Response {
  console.error("Security error:", error);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (error instanceof SecurityError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        error_id: crypto.randomUUID(),
      }),
      {
        status: error.statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Generischer Fehler - keine Details preisgeben
  return new Response(
    JSON.stringify({
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      error_id: crypto.randomUUID(),
    }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
