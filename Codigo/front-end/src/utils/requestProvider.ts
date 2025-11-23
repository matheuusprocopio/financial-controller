export type RequestError = { error: { status: number; message: string; resource: string } };

export type RequestHeaders = { [key: string]: string };

const respValidation = async (resp: Response): Promise<RequestError | null> => {
  try {
    if (resp.ok) return null;

    const data = await resp.json();

    return { error: { status: resp.status, message: JSON.stringify(data), resource: resp.url } };
  } catch (err) {
    return {
      error: { status: resp.status, message: "Invalid response", resource: resp.url },
    };
  }
};

export default function newRequestProvider(baseUrl: string, defaultHeaders?: RequestHeaders) {
  const BASE_URL = baseUrl + "/";
  const DEFAULT_HEADERS = { "Content-Type": "application/json", ...defaultHeaders };

  const buildResource = (endpoint?: string) => `${BASE_URL}${endpoint ?? ""}`;

  const handleRequest = async <Resp>(
    endpoint: string | undefined,
    fetcher: () => Promise<Response>,
    parser: (resp: Response) => Promise<Resp>,
  ): Promise<Resp | RequestError> => {
    try {
      const resp = await fetcher();
      const validationResp = await respValidation(resp);

      if (validationResp !== null) return validationResp;

      return await parser(resp);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      return { error: { status: 500, message, resource: buildResource(endpoint) } };
    }
  };

  const get = async <GetResp>(
    endpoint?: string,
    options?: {
      next?: NextFetchRequestConfig;
      cache?: RequestCache;
      headers?: RequestHeaders;
    },
  ): Promise<GetResp | RequestError> => {
    return handleRequest<GetResp>(
      endpoint,
      () =>
        fetch(BASE_URL + endpoint, {
          method: "GET",
          headers: {
            ...DEFAULT_HEADERS,
            ...options?.headers,
          },
          cache: options?.cache,
          next: options?.next,
        }),
      async (resp) => (await resp.json()) as GetResp,
    );
  };

  const post = async <PostResp, PostBody = undefined>(
    endpoint?: string,
    options?: {
      body?: PostBody;
      headers?: RequestHeaders;
    },
  ): Promise<PostResp | RequestError> => {
    return handleRequest<PostResp>(
      endpoint,
      () =>
        fetch(BASE_URL + endpoint, {
          method: "POST",
          body: JSON.stringify(options?.body),
          headers: {
            ...DEFAULT_HEADERS,
            ...options?.headers,
          },
        }),
      async (resp) => (await resp.json()) as PostResp,
    );
  };

  const put = async <PutResp, PutBody = undefined>(
    endpoint?: string,
    options?: {
      body?: PutBody;
      headers?: RequestHeaders;
    },
  ): Promise<PutResp | RequestError> => {
    return handleRequest<PutResp>(
      endpoint,
      () =>
        fetch(BASE_URL + endpoint, {
          method: "PUT",
          body: JSON.stringify(options?.body),
          headers: {
            ...DEFAULT_HEADERS,
            ...options?.headers,
          },
        }),
      async (resp) => (await resp.json()) as PutResp,
    );
  };

  const patch = async <PatchResp, PatchBody = undefined>(
    endpoint?: string,
    options?: {
      body?: PatchBody;
      headers?: RequestHeaders;
    },
  ): Promise<PatchResp | RequestError> => {
    return handleRequest<PatchResp>(
      endpoint,
      () =>
        fetch(BASE_URL + endpoint, {
          method: "PATCH",
          body: JSON.stringify(options?.body),
          headers: {
            ...DEFAULT_HEADERS,
            ...options?.headers,
          },
        }),
      async (resp) => {
        const text = await resp.text();
        if (text.trim() === "" || text.trim() === "null") {
          return {} as PatchResp;
        }

        return JSON.parse(text) as PatchResp;
      },
    );
  };

  const deleteFunc = async <DeleteResp>(
    endpoint?: string,
    options?: {
      headers?: RequestHeaders;
    },
  ): Promise<DeleteResp | RequestError> => {
    return handleRequest<DeleteResp>(
      endpoint,
      () =>
        fetch(BASE_URL + endpoint, {
          method: "DELETE",
          headers: {
            ...DEFAULT_HEADERS,
            ...options?.headers,
          },
        }),
      async (resp) => {
        if (!resp.body || resp.status === 204) {
          return {} as DeleteResp;
        }

        return (await resp.json()) as DeleteResp;
      },
    );
  };

  return {
    get,
    post,
    put,
    patch,
    delete: deleteFunc,
  };
}
