export {};

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: unknown,
          result: {
            event?: string;
            info?: { secure_url?: string; public_id?: string };
          }
        ) => void
      ) => {
        open: () => void;
      };
    };
  }
}
