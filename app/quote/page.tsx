import QuoteForm from "@/components/QuoteForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function QuotePage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center py-10">
      <AnimatedBackground />
      <QuoteForm />
    </div>
  );
}
