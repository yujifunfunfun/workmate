import { NavLinks } from "@/components/NavLinks";


export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-18 bg-white shadow-md z-10 overflow-y-auto">
      <NavLinks/>
    </aside>
  );
}
