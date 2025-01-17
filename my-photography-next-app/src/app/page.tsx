"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/about"); // Redirect to the /about page
  }, [router]);

  return <p>Redirecting...</p>;
}
