import Image from "next/image";
import { studentNavigation } from "../model/navigation";

export function StudentSidebar() {
  return (
    <aside className="hidden min-h-full border-r border-line bg-white lg:flex lg:flex-col">
      <nav className="space-y-2 p-5">
        {studentNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-[15px] font-medium transition ${item.active ? "bg-brand/10 text-brand" : "text-ink hover:bg-panel"}`}
              key={item.label}
              type="button"
            >
              <Icon className="size-6" strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-6">
        <Image
          alt="Помощник ExamClass"
          className="mx-auto h-auto w-full max-w-[220px]"
          height={1446}
          src="/header-rabbit.png"
          width={1086}
        />
      </div>
    </aside>
  );
}
