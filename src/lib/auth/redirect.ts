// src/lib/auth/redirect.ts

/**
 * Redirect user after successful login/registration based on their roles
 * - User (id: 3) or Astrologer (id: 2) → "/"
 * - Admin or other roles → "/admin/dashboard"
 */
export async function redirectAfterAuth(): Promise<void> {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      // If API fails, default to home page
      window.location.href = "/";
      return;
    }

    const { data } = await response.json();

    // Extract role IDs
    const roleIds = data.roles.map((r: any) => parseInt(r.id));

    // Check if user has User (3) or Astrologer (2) role
    const hasUserRole = roleIds.includes(3);
    const hasAstrologerRole = roleIds.includes(2);

    if (hasUserRole || hasAstrologerRole) {
      // Regular user or astrologer → home page
      window.location.href = "/";
    } else {
      // Admin or other roles → admin dashboard
      window.location.href = "/admin/dashboard";
    }
  } catch (error) {
    console.error("Redirect error:", error);
    // Fallback to home page on error
    window.location.href = "/";
  }
}

/**
 * Check if user has admin access (NOT user or astrologer)
 */
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      return false;
    }

    const { data } = await response.json();
    const roleIds = data.roles.map((r: any) => parseInt(r.id));

    // Admin = NOT user (3) AND NOT astrologer (2)
    return !roleIds.includes(3) && !roleIds.includes(2);
  } catch (error) {
    console.error("Admin access check error:", error);
    return false;
  }
}

/**
 * Get user roles from API
 */
export async function getUserRoles(): Promise<number[]> {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      return [];
    }

    const { data } = await response.json();
    return data.roles.map((r: any) => parseInt(r.id));
  } catch (error) {
    console.error("Get user roles error:", error);
    return [];
  }
}