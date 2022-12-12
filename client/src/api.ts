import { OutputParams } from './params';

export const generate = (): Promise<OutputParams> =>
  // fetch('https://127.0.0.1:17337/generate')
  fetch('https://127.0.0.1:17337/generate')
    .then((response) => response.json())
    .then((response) => JSON.parse(response) as OutputParams);

export const decode = (inputList: number[]): Promise<OutputParams> =>
  // fetch(`https://lofiserver.jacobzhang.de/decode?input=${JSON.stringify(inputList)}`)
  // fetch(`http://127.0.0.1:17337/decode?input=${JSON.stringify(inputList)}`)
  fetch(`http://lofiapi_stage.gate.taicudt.com:8084/decode?input=${JSON.stringify(inputList)}`)
  .then((response) => response.json())
    .then((response) => JSON.parse(response) as OutputParams);
