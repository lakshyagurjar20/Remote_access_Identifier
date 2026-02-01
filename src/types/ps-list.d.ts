declare module "ps-list" {
  interface Process {
    pid: number;
    name: string;
    cmd?: string;
  }

  function psList(): Promise<Process[]>;
  export default psList;
}
