// src/pages/TrainSchedule.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trainService } from "@/services/trainService";
import { AddTrainTripModal } from "@/components/AddTrainTripModal";
import { Button } from "@/components/ui/button";

interface Train {
  train_id: string;
  route: string;
  departure: string;
  arrival: string;
  capacity: number;
}

const TrainSchedule = () => {
  const [open, setOpen] = useState(false);

  const { data: trains = [], isLoading } = useQuery<Train[]>({
    queryKey: ["trains"],
    queryFn: trainService.getAllTrains,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Train Schedule</h1>
        <Button onClick={() => setOpen(true)}>Add New Trip</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trains.map((train) => (
          <div key={train.train_id} className="p-4 border rounded-xl shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{train.train_id}</h2>
            <p className="text-gray-600">{train.route}</p>
            <p className="text-gray-500">Departure: {train.departure}</p>
            <p className="text-gray-500">Arrival: {train.arrival}</p>
            <p className="text-gray-500">Capacity: {train.capacity}</p>
          </div>
        ))}
      </div>

      {/* Add Train Trip Modal */}
      <AddTrainTripModal open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default TrainSchedule;
