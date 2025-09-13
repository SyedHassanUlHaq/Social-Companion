import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Example: Call ElevenLabs Agent API here
    const res = await fetch("https://api.elevenlabs.io/v1/agents/agent_9201k4v3j6g8fs7vxt14qxngw8n5", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Add payload depending on how you want to trigger the agent
        input: "Hello from my Next.js app!",
      }),
    });

    const data = await res.json();

    return NextResponse.json({ message: "Agent called!", data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to call ElevenLabs agent" }, { status: 500 });
  }
}
