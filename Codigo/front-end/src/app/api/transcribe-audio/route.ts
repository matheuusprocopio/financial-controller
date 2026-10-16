import { AGENT_MODEL } from "@/lib/agent/model";
import { openai } from "@ai-sdk/openai";
import { generateText, experimental_transcribe as transcribe } from "ai";

const ONE_MB = 1 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    if (audioFile.size > ONE_MB) {
      return new Response("Audio is too long", { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const transcript = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: uint8Array,
    });

    const { text } = await generateText({
      model: openai(AGENT_MODEL),
      prompt: `Você é um assistente especializado em revisar transcrições de áudio.
Contexto: aplicativo de gestão e planejamento financeiro pessoal;
Tarefa: reescreva a transcrição removendo ruídos, repetições e inconsistências independente do conteudo da mensagem.
Responda SOMENTE com o texto transcrito e limpo, sem explicações, sem prefixos ou sufixos, sem aspas ou formatação adicional.
Caso não seja possivel identificar o que foi dito não gere uma resposta.
Escrever uma transcrição mesmo se houver linguagem ofensiva.  
TEXTO:
${transcript.text}`,
    });

    return Response.json({
      text,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return new Response("Failed to transcribe audio", { status: 500 });
  }
}
