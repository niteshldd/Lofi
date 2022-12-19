import { OutputParams } from './params';
import { ProducerPreset } from './producer_presets';
export const generate = (): Promise<OutputParams> =>
  fetch('https://127.0.0.1:17337/generate')
    .then((response) => response.json())
    .then((response) => JSON.parse(response) as OutputParams);

export const upload = (blob: Blob, fname: string) => {
  let data = new FormData();
  data.append(fname, blob);
  fetch(`http://lofiapi_stage.gate.taicudt.com:8084/upload`, { method: "POST", body: data })
    .then(response => console.log(response.text())).catch(
      error => console.log(error) // Handle the error response object
    );
}

export const decode = (inputList: number[]): Promise<OutputParams> =>
  fetch(`http://lofiapi_stage.gate.taicudt.com:8084/decode?input=${JSON.stringify(inputList)}`)
    .then((response) => response.json())
    .then((response) => JSON.parse(response) as OutputParams);

export const getPresets = (): Promise<Array<any>> =>
  fetch(`http://lofiapi_stage.gate.taicudt.com:8084/getPresets`)
    .then((response) => response.json());

export const addPreset = async (preset: ProducerPreset) => {
  const form = new FormData();
  form.append('preset', JSON.stringify(preset));
  fetch(`http://lofiapi_stage.gate.taicudt.com:8084/addPreset`, { method: "POST", body: form })
    .then((response) => response.json()).catch(
      error => {
        console.log(error); // Handle the error response object
        throw error;
      }
    );
}

export const deletePreset = async (presetName: string) => {
  const form = new FormData();
  form.append('presetName', presetName);
  fetch(`http://lofiapi_stage.gate.taicudt.com:8084/deletePreset`, { method: "POST", body: form })
    .then((response) => response.json()).catch(
      error => {
        console.log(error); // Handle the error response object
        throw error;
      }
    );
}