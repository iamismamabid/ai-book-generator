// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  // If the user is already logged in, redirect them away from the sign-in page
  if (userId) {
    redirect("/dashboard"); // Replace with your desired post-login route
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center py-20 px-4">
      <SignIn signUpUrl="/sign-up" initialValues={{ emailAddress: "" }} />
    </div>
  );
}