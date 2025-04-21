import { NavLinks } from "@/components/NavLinks";


export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-md z-10 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">WorkMate</h2>
      </div>
      <NavLinks/>
    </aside>
  );
}
