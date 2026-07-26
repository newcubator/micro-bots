export type HttpRequest = {
  body?: string;
  query?: Record<string, string | undefined>;
};

export type HttpResponse = {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
};
