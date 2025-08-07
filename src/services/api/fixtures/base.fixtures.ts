export interface IAxiosReturnInterface<T = any> {
  data: T; 
  status: number; 
  statusText: string; // Status message (e.g., "OK")
}


export async function mockAxiosResponse<T>(
  fixture: T,
  status: number
): Promise<IAxiosReturnInterface<T>> {
  return {
    data: fixture, 
    status: status, 
    statusText: 'OK'
  };
}