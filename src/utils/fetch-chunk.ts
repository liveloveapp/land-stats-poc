import { IServerSideGetRowsRequest } from 'ag-grid-enterprise';

export async function fetchChunk(
  request: IServerSideGetRowsRequest,
): Promise<any> {
  const response = await fetch(`http://localhost:3000/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.body) throw new Error('ReadableStream not supported');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let jsonString = '';
  let done = false;

  while (!done) {
    const { value, done: chunkDone } = await reader.read();
    done = chunkDone;
    if (value) {
      jsonString += decoder.decode(value, { stream: true });
    }
  }

  const jsonData = JSON.parse(jsonString);
  console.log(jsonData);
  return jsonData;
}
