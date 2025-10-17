import { useParams } from "react-router-dom";

const TrainDetails = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Train Details - {id}</h1>
      <p className="text-gray-600 mt-2">
        This page shows detailed information about train {id}.
      </p>
    </div>
  );
};

export default TrainDetails;
