import { Toaster } from "@/components/ui/sonner";
import { ScheduleAdjustmentForm } from "@/app/(app)/library/agent/schedule-adjustment/_components/ScheduleAdjustmentForm";


export default function ScheduleAdjustmentPage() {
  return (
    <>
      <ScheduleAdjustmentForm />
      <Toaster />
    </>
  );
}
