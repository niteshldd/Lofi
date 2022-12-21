import { OutputParams } from './params';
import { ProducerPreset } from './producer_presets';

const uploadAPI = 'http://lofiapi_stage.gate.taicudt.com:8084/upload'
const decodeAPI = 'http://lofiapi_stage.gate.taicudt.com:8084/decode'
const getPresetAPI = 'http://lofiapi_stage.gate.taicudt.com:8084/getPresets'
const addPresetAPI = 'http://lofiapi_stage.gate.taicudt.com:8084/addPreset'
const deletePresetAPI = 'http://lofiapi_stage.gate.taicudt.com:8084/deletePreset'
const getModelsAPI = 'http://lofiapi_stage.gate.taicudt.com:8084/getModels'

export const upload = (blob: Blob, fname: string) => {
  let data = new FormData();
  data.append(fname, blob);
  fetch(uploadAPI, { method: "POST", body: data }).catch(
    error => console.log(error) // Handle the error response object
  );
}

export const decode = async (inputList: number[], model: string): Promise<OutputParams> => {
  let form = new FormData();
  form.append('input', JSON.stringify(inputList));
  form.append('model', model);
  return fetch(decodeAPI, { method: 'POST', body: form })
    .then((response) => response.json())
      .then((response) => JSON.parse(response) as OutputParams)
}


export const getPresets = (): Promise<Array<any>> =>
  fetch(getPresetAPI)
    .then((response) => response.json());

export const addPreset = async (preset: ProducerPreset) => {
  const form = new FormData();
  form.append('preset', JSON.stringify(preset));
  fetch(addPresetAPI, { method: "POST", body: form })
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
  fetch(deletePresetAPI, { method: "POST", body: form })
    .then((response) => response.json()).catch(
      error => {
        console.log(error); // Handle the error response object
        throw error;
      }
    );
}

export const getModels = async (): Promise<string[]> =>
  fetch(getModelsAPI)
    .then((response) => response.json()).then((response) => response['models'] as string[]);
