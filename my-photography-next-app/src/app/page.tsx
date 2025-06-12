// app/page.tsx (no "use client" here)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/gallery");
}
