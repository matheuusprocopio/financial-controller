export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  components?: React.ReactNode;
};
