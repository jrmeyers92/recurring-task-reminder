"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateTaskDialog } from "./CreateTaskDialog";

export function CreateTaskButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        <Plus size={20} className="mr-2" />
        New Task
      </Button>
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
