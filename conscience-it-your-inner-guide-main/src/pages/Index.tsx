import Sidebar from "@/components/Sidebar";
import ChatContainer from "@/components/ChatContainer";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
};

export default Index;