import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();

  // If user is already logged in, redirect them
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center py-20 px-4">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
