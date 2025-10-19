import ManageCities from "./ManageCities";

// Full-page wrapper to render ManageCities in the main outlet
export default function ManageCitiesPage() {
  return <ManageCities isOpen={true} onClose={() => { /* handled by route change */ }} />;
}
