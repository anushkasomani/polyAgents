import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const handleStartIntent = () => {
    // Will be implemented when we add routing
    console.log("Starting new intent...");
  };

  return <Dashboard onStartIntent={handleStartIntent} />;
};

export default Index;
