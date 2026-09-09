export type AppMode = "tenant" | "owner";
export type User = {
  id: string;
  name: string;
  phone: string;
  mode: AppMode;
};
