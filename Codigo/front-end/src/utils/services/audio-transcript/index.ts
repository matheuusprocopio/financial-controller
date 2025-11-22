export type TranscribeResponse = {
  text: string;
};

export async function transcribeAudio(file: File): Promise<TranscribeResponse> {
  const formData = new FormData();
  formData.append("audio", file);

  const resp = await fetch("/api/transcribe-audio", {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    throw new Error("Falha ao transcrever o áudio");
  }

  return resp.json();
}
