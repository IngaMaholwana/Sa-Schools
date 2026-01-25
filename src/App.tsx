import { Map } from "@/components/ui/map";

export function BasicMapExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[-26.2041, 28.0473]} zoom={6} />
    </div>
  );
}

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">South African Schools Map</h1>
      <BasicMapExample />
    </div>
  );
}

export default App;
