/**
 * Helper to automatically sync contacts to Loops.so
 * Triggers the automated onboarding workflow when contacts are added to the audience.
 */
export async function addContactToLoops(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  userGroup?: string;
  subscribed?: boolean;
}): Promise<boolean> {
  const apiKey =
    process.env.LOOPS_API_KEY ||
    process.env.NEXT_PUBLIC_LOOPS_API_KEY ||
    "9bb7152cfdb39d354de6ea5b88b5f4af";

  if (!apiKey || !params.email) {
    return false;
  }

  const cleanEmail = params.email.trim().toLowerCase();
  if (!cleanEmail.includes("@")) {
    return false;
  }

  try {
    const payload: Record<string, any> = {
      email: cleanEmail,
      source: params.source || "kdpage_web",
      userGroup: params.userGroup || "free",
      subscribed: params.subscribed ?? true,
    };

    if (params.firstName?.trim()) {
      payload.firstName = params.firstName.trim();
    }
    if (params.lastName?.trim()) {
      payload.lastName = params.lastName.trim();
    }

    const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 409 Conflict means contact already exists in Loops audience
    if (res.status === 409) {
      await fetch("https://app.loops.so/api/v1/contacts/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: payload.firstName,
          lastName: payload.lastName,
          userGroup: payload.userGroup,
        }),
      }).catch(() => {});
      return true;
    }

    return res.ok;
  } catch (err) {
    console.error("Failed to sync contact to Loops:", err);
    return false;
  }
}
