import Footer from "@/components/footer";
import Header from "@/components/header";
import { ScrollArea } from "@mantine/core";
import NextTopLoader from "nextjs-toploader";

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea
      className="scroll-smooth"
      type="scroll"
      classNames={{ scrollbar: "z-10" }}
    >
      <div className="flex flex-col min-h-screen w-screen">
        <Header />
        <NextTopLoader color="#EF4444" showSpinner={true} height={5} />
        {children}
        <Footer />
      </div>
    </ScrollArea>
  );
}
