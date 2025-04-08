import { Toaster } from "@/components/ui/sonner";
import { SalesSearchForm } from "@/app/library/agent/sales-case/_components/SalesSearchForm";

export default function SalesCasePage() {
  return (
    <>
      <SalesSearchForm />
      <Toaster />
    </>
  );
}
