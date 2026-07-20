import type { Metadata } from "next";
import { BlogIndex } from "./blog-client";

export const metadata: Metadata = {
  title: "Blog — AIMLO",
  description:
    "Valorant mekanikleri, harita okuma, round ekonomisi ve ajan kullanımı üzerine öğretici yazılar. AIMLO blog.",
};

export default function BlogPage() {
  return <BlogIndex />;
}
