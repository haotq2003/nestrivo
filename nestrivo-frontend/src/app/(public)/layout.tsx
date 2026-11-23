import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareBar from "@/components/compare/CompareBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAEF] text-[#373523]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
    </div>
  );
}
