"use client";

import ErrorState from "@/components/chat/gen-ui/ErrorState";
import LoadingState from "@/components/chat/gen-ui/LoadingState";

interface IActionWrapper {
  children: React.ReactNode;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
}

const ActionWrapper = ({ children, state }: IActionWrapper) => {
  if (state == "output-error") {
    return <ErrorState message={"Teste"} />;
  }

  if (state == "input-available") {
    return <LoadingState />;
  }

  return <div className="w-full max-w-[95%]">{children}</div>;
};

export default ActionWrapper;
