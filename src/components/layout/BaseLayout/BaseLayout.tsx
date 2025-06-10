import { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";

export const BaseLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="grid grid-cols-[auto_1fr]">
      <Sidebar />
      <div className="bg-[#221D27]">{children}</div>
    </div>
  );
};
