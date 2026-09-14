export type HttpRequest = {
  body?: string;
  query?: Record<string, string | undefined>;
  origin?: string;
};

export type HttpResponse = {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
};
