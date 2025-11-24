export const getErrorMessage = (error: unknown): string | null => {
  if (!error) return null;

  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (typeof error === "object" && "error" in (error as Record<string, unknown>)) {
    const nestedError = (error as Record<string, unknown>).error;

    if (typeof nestedError === "string") return nestedError;

    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in (nestedError as Record<string, unknown>) &&
      typeof (nestedError as Record<string, unknown>).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  return "Erro ao executar a ação da ferramenta.";
};