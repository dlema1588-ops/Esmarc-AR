export type JsonResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};
