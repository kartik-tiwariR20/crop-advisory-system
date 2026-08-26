import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fasal Sathi - Dashboard",
  description: "Crop Advisory Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
