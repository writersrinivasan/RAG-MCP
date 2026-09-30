import type { Metadata } from "next";
import "./globals.css";
import "reactflow/dist/style.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Enterprise Agentic AI Workshop — RAG, MCP, Governance & Production",
  description:
    "Hands-on training platform showing how LangGraph agents use RAG, MCP, governance and production practices, framed around a real industry problem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-slate-100 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
