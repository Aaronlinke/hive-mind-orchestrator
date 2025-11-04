import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🤖 Security Manager AI - Die zentrale Sicherheits-KI
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, resource, details } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;

    switch (action) {
      case "validate_access":
        result = await validateAccess(supabase, userId, resource, details);
        break;
      
      case "encrypt_data":
        result = await encryptData(details.data, details.key);
        break;
      
      case "decrypt_data":
        result = await decryptData(details.encryptedData, details.key, details.iv);
        break;
      
      case "audit_log":
        result = await createAuditLog(supabase, userId, resource, details, req);
        break;
      
      case "check_rate_limit":
        result = await checkRateLimit(supabase, userId, resource);
        break;
      
      case "validate_input":
        result = await validateInput(details.input, details.schema);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Security Manager Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Sicherheitsüberprüfung fehlgeschlagen",
        error_id: crypto.randomUUID()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// 🔐 Zugriffskontrolle durch Security Manager
async function validateAccess(
  supabase: any,
  userId: string,
  resource: string,
  details: any
): Promise<{ allowed: boolean; reason?: string }> {
  // Prüfe ob Benutzer existiert
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
  
  if (userError || !user) {
    return { allowed: false, reason: "Benutzer nicht gefunden" };
  }

  // Prüfe Benutzerrollen
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const userRoles = roles?.map((r: any) => r.role) || [];

  // Admin hat immer Zugriff
  if (userRoles.includes("admin")) {
    return { allowed: true, reason: "Admin-Zugriff" };
  }

  // Security Bot hat Zugriff auf Audit-Funktionen
  if (userRoles.includes("security_bot") && resource.startsWith("audit_")) {
    return { allowed: true, reason: "Security Bot Zugriff" };
  }

  // Manager hat erweiterte Rechte
  if (userRoles.includes("manager") && ["workflows", "analytics", "prompts"].includes(resource)) {
    return { allowed: true, reason: "Manager-Zugriff" };
  }

  // Standardbenutzer: Nur eigene Ressourcen
  if (details.resourceOwnerId === userId) {
    return { allowed: true, reason: "Eigene Ressource" };
  }

  return { allowed: false, reason: "Keine Berechtigung" };
}

// 🔒 AES-256-GCM Verschlüsselung
async function encryptData(data: string, key: string): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generiere Schlüssel aus Passphrase
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("lovable-security-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  // Generiere IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Verschlüssele
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    dataBuffer
  );
  
  // Konvertiere zu Base64
  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const encrypted = btoa(String.fromCharCode(...encryptedArray));
  const ivBase64 = btoa(String.fromCharCode(...Array.from(iv)));
  
  return { encrypted, iv: ivBase64 };
}

// 🔓 AES-256-GCM Entschlüsselung
async function decryptData(encryptedData: string, key: string, iv: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Generiere Schlüssel aus Passphrase
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("lovable-security-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  // Konvertiere von Base64
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  // Entschlüssele
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    cryptoKey,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// 📝 Audit-Logging
async function createAuditLog(
  supabase: any,
  userId: string | null,
  resource: string,
  details: any,
  req: Request
): Promise<{ logged: boolean }> {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.headers.get("x-forwarded-for") || 
             req.headers.get("x-real-ip") || 
             "unknown";

  const { error } = await supabase.from("security_audit_log").insert({
    user_id: userId,
    action: details.action,
    resource,
    details: details.additionalInfo || {},
    ip_address: ip,
    user_agent: userAgent,
    success: details.success !== false,
  });

  if (error) {
    console.error("Audit log error:", error);
    return { logged: false };
  }

  return { logged: true };
}

// ⏱️ Rate Limiting
async function checkRateLimit(
  supabase: any,
  userId: string,
  resource: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = 60000; // 1 Minute
  const maxRequests = 100;
  
  const { data: logs, error } = await supabase
    .from("security_audit_log")
    .select("created_at")
    .eq("user_id", userId)
    .eq("resource", resource)
    .gte("created_at", new Date(Date.now() - windowMs).toISOString());

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, remaining: maxRequests };
  }

  const requestCount = logs?.length || 0;
  const remaining = Math.max(0, maxRequests - requestCount);
  
  return {
    allowed: requestCount < maxRequests,
    remaining,
  };
}

// ✅ Input-Validierung
async function validateInput(input: any, schema: any): Promise<{ valid: boolean; errors?: string[] }> {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];
    const rule = rules as any;
    
    // Required check
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field} ist erforderlich`);
      continue;
    }
    
    if (value === undefined || value === null) continue;
    
    // Type check
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${field} muss vom Typ ${rule.type} sein`);
    }
    
    // String validations
    if (rule.type === "string" && typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} muss mindestens ${rule.minLength} Zeichen lang sein`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} darf maximal ${rule.maxLength} Zeichen lang sein`);
      }
      if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
        errors.push(`${field} hat ein ungültiges Format`);
      }
    }
    
    // Number validations
    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} muss mindestens ${rule.min} sein`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} darf maximal ${rule.max} sein`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
