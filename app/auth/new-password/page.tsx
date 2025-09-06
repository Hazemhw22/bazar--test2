"use client";

import { Suspense } from "react";
import NewPasswordForm from "../../../components/NewPasswordForm";

// نجبر الصفحة تكون dynamic (عشان ما يصير Pre-rendering error في Vercel)
export const dynamic = "force-dynamic";

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
}
