import { OutputParams } from './params';
import { ProducerPreset } from './producer_presets';
const backend_addr = 'http://lofiapi_stage.gate.taicudt.com:8084'

const uploadAPI = `${backend_addr}/upload`
const decodeAPI = `${backend_addr}/decode`
const getPresetAPI = `${backend_addr}/getPresets`
const addPresetAPI = `${backend_addr}/addPreset`
const deletePresetAPI = `${backend_addr}/deletePreset`
const getModelsAPI = `${backend_addr}/getModels`

export const  upload = async (blob: Blob, fname: string) => {
  let retry = 3;
  while (retry > 0){
    retry -= 1;
    try{
      let data = new FormData();
      data.append(fname, blob);
      fetch(uploadAPI, { method: "POST", body: data })
      break;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(error) // Handle the error response object
    }
  }
  console.log("upload failed")
}


export const decode = async (inputList: number[], model: string): Promise<OutputParams> => {
  let retry = 3;
  while (retry > 0){
    retry -= 1;
    try{
      let form = new FormData();
      form.append('input', JSON.stringify(inputList));
      form.append('model', model);
      return fetch(decodeAPI, { method: 'POST', body: form })
        .then((response) => response.json())
          .then((response) => JSON.parse(response) as OutputParams);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(error) // Handle the error response object
    }
  }
  console.log("decode failed")
}


export const getPresets = async (): Promise<Array<any>> => {
  let retry = 3;
  while (retry > 0){
    retry -= 1;
    try{
      const response = await fetch(getPresetAPI);
      return await response.json();
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(error) // Handle the error response object
    }
  }
  console.log("getPresets failed")
}


export const addPreset = async (preset: ProducerPreset) => {
  let retry = 3;
  while (retry > 0){
    retry -= 1;
    try{
      let form = new FormData();
      form.append('preset', JSON.stringify(preset));
      fetch(addPresetAPI, { method: "POST", body: form })
      return ;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(error) // Handle the error response object
    }
  }
  console.log("addPreset failed")
}

export const deletePreset = async (presetName: string) => {
  let retry = 3;
  while (retry > 0){
    retry -= 1;
    try{
      const form = new FormData();
      form.append('presetName', presetName);
      fetch(deletePresetAPI, { method: "POST", body: form })
        .then((response) => response.json()).catch(
          error => {
            console.log(error); // Handle the error response object
            throw error;
          }
        );
      return ;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(error) // Handle the error response object
    }
  console.log("deletePreset failed")
  }
}

export const getModels = async (): Promise<string[]> => {
  let retry = 3;
  while (retry > 0){
    retry -= 1;
    try{
      return fetch(getModelsAPI)
        .then((response) => response.json()).then((response) => response['models'] as string[]);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(error) // Handle the error response object
    }
  }
  console.log("getModels failed")
}

