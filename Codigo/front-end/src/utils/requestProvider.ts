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

  const get = async <GetResp>(
    endpoint?: string,
    options?: {
      next?: NextFetchRequestConfig;
      cache?: RequestCache;
      headers?: RequestHeaders;
    },
  ): Promise<GetResp | RequestError> => {
    const resp = await fetch(BASE_URL + endpoint, {
      method: "GET",
      headers: {
        ...DEFAULT_HEADERS,
        ...options?.headers,
      },
      cache: options?.cache,
      next: options?.next,
    });
    const validationResp = await respValidation(resp);

    if (validationResp !== null) return validationResp;

    const data = (await resp.json()) as GetResp;

    return data;
  };

  const post = async <PostResp, PostBody = undefined>(
    endpoint?: string,
    options?: {
      body?: PostBody;
      headers?: RequestHeaders;
    },
  ): Promise<PostResp | RequestError> => {
    const resp = await fetch(BASE_URL + endpoint, {
      method: "POST",
      body: JSON.stringify(options?.body),
      headers: {
        ...DEFAULT_HEADERS,
        ...options?.headers,
      },
    });
    const validationResp = await respValidation(resp);

    if (validationResp !== null) return validationResp;

    const data = (await resp.json()) as PostResp;

    return data;
  };

  const put = async <PutResp, PutBody = undefined>(
    endpoint?: string,
    options?: {
      body?: PutBody;
      headers?: RequestHeaders;
    },
  ): Promise<PutResp | RequestError> => {
    const resp = await fetch(BASE_URL + endpoint, {
      method: "PUT",
      body: JSON.stringify(options?.body),
      headers: {
        ...DEFAULT_HEADERS,
        ...options?.headers,
      },
    });
    const validationResp = await respValidation(resp);

    if (validationResp !== null) return validationResp;

    const data = (await resp.json()) as PutResp;

    return data;
  };

  const patch = async <PatchResp, PatchBody = undefined>(
    endpoint?: string,
    options?: {
      body?: PatchBody;
      headers?: RequestHeaders;
    },
  ): Promise<PatchResp | RequestError> => {
    const resp = await fetch(BASE_URL + endpoint, {
      method: "PATCH",
      body: JSON.stringify(options?.body),
      headers: {
        ...DEFAULT_HEADERS,
        ...options?.headers,
      },
    });
    const validationResp = await respValidation(resp);

    if (validationResp !== null) return validationResp;

    const text = await resp.text();
    if (text.trim() === "" || text.trim() === "null") {
      return {} as PatchResp;
    }

    const data = JSON.parse(text) as PatchResp;

    return data;
  };

  const deleteFunc = async <DeleteResp>(
    endpoint?: string,
    options?: {
      headers?: RequestHeaders;
    },
  ): Promise<DeleteResp | RequestError> => {
    const resp = await fetch(BASE_URL + endpoint, {
      method: "DELETE",
      headers: {
        ...DEFAULT_HEADERS,
        ...options?.headers,
      },
    });
    const validationResp = await respValidation(resp);

    if (validationResp !== null) return validationResp;

    if (!resp.body || resp.status === 204) {
      return {} as DeleteResp;
    }

    const data = (await resp.json()) as DeleteResp;

    return data;
  };

  return {
    get,
    post,
    put,
    patch,
    delete: deleteFunc,
  };
}
