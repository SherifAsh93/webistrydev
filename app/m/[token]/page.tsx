import ChatPage from "./ChatPage";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ChatPage token={token} />;
}
