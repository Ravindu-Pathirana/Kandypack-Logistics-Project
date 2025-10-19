// src/components/AddTrainTripModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trainService } from "@/services/trainService";

interface AddTrainTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTrainTripModal = ({ open, onOpenChange }: AddTrainTripModalProps) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    train_id: "",
    route: "",
    departure: "",
    arrival: "",
    capacity: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const mutation = useMutation({
    mutationFn: trainService.createTrainTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trains"] });
      onOpenChange(false);
      setForm({ train_id: "", route: "", departure: "", arrival: "", capacity: "" });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.train_id || !form.route || !form.departure || !form.arrival || !form.capacity) {
      alert("Please fill all fields.");
      return;
    }

    mutation.mutate({
      ...form,
      capacity: Number(form.capacity),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Train Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 mt-3">
          <Input name="train_id" placeholder="Train ID" value={form.train_id} onChange={handleChange} />
          <Input name="route" placeholder="Route (e.g. Kandy → Colombo)" value={form.route} onChange={handleChange} />
          <Input name="departure" placeholder="Departure Time" value={form.departure} onChange={handleChange} />
          <Input name="arrival" placeholder="Arrival Time" value={form.arrival} onChange={handleChange} />
          <Input type="number" name="capacity" placeholder="Capacity" value={form.capacity} onChange={handleChange} />

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Train Trip"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
