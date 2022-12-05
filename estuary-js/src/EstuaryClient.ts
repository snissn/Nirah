import axios from 'axios';
import { packToBlob } from 'ipfs-car/pack/blob';
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory';
import { packToFs } from 'ipfs-car/pack/fs';
import { FsBlockStore } from 'ipfs-car/blockstore/fs';
import FormData from 'form-data';
import * as fs from 'fs';
import { CarReader } from '@ipld/car/reader';
import fetch from 'node-fetch';
export class Pin {
  status: string;
  created: string;
  delegates: string[];
  cid: string;
  name: string;
  constructor(status: string, created: string, delegates: string[], cid: string, name: string) {
    this.status = status;
    this.created = created;
    this.delegates = delegates;
    this.cid = cid;
    this.name = name;
  }
  deletePin() {
    //delete pin
  }
}
export type Key = {
  token: string,
  tokenHash: string,
  label: string,
  expiry: string,
};

export const getPins = async (apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;

  try {
    let res = await axios.get(`https://api.estuary.tech/pinning/pins`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    let pins: Pin[];
    pins = res.data.results.map((result: any) => {
      return new Pin(result.status, result.created, result.delegates, result.pin.cid, result.pin.name);
    });
    return pins;
  } catch (err) {
    console.log(`EstuaryJS(getPins): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};

export const getPin = async (cid: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.get(`https://api.estuary.tech/pinning/pins/${cid}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return new Pin(res.data.status, res.data.created, res.data.delegates, res.data.pin.cid, res.data.pin.name);
  } catch (err) {
    console.log(`EstuaryJS(getPin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};

export const addPin = async (cid: string, name?: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.post(
      `https://api.estuary.tech/pinning/pins`,
      {
        cid: cid,
        name: name ? name : cid,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return new Pin(res.data.status, res.data.created, res.data.delegates, res.data.pin.cid, res.data.pin.name);
  } catch (err) {
    console.log(`EstuaryJS(addPin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};

export const deletePin = async (cid: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.delete(`https://api.estuary.tech/pinning/pins/${cid}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return res;
  } catch (err) {
    console.log(`EstuaryJS(deletePin): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};

export const getKeys = async (apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.get(`https://api.estuary.tech/user/api-keys`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    let keys: Key[] = res.data.results.map((result: any) => {
      return {
        token: result.token,
        tokenHash: result.tokenHash,
        label: result.label,
        expiry: result.expiry,
      };
    });
    return keys;
  } catch (err) {
    console.log(`EstuaryJS(getKeys): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};
export const createKey = async (expiry: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  /*
            Create a new key
            Expiry:string - Expiration - Valid time units are ns, us (or µs), ms, s, m, h. for example 300h
            */
  try {
    let res = await axios.post(
      `https://api.estuary.tech/user/api-keys`,
      {
        expiry: expiry,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return {
      token: res.data.token,
      tokenHash: res.data.tokenHash,
      label: res.data.label,
      expiry: res.data.expiry,
    };
  } catch (err) {
    console.log(`EstuaryJS(createKey): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};
export const deleteKey = async (key: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  try {
    let res = await axios.delete(`https://api.estuary.tech/user/api-keys/${key}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return res;
  } catch (err) {
    console.log(`EstuaryJS(deleteKey) Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
  }
};

export const addFile = async (file: any, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  const formData = new FormData();
  formData.append('data', file);

  try {
    let res = await axios.post(`https://upload.estuary.tech/content/add`, formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return res.data;
  } catch (err) {
    console.log(`EstuaryJS: addFile Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
    return err;
  }
};

export const addFiles = async (directory: string, name: string, apiKey?: string) => {
  const API_KEY = process.env.Estuary_API_KEY || apiKey;
  await packToFs({
    input: `${directory}`,
    output: `${directory}/${name}.car`,
    blockstore: new FsBlockStore(),
  });
  let path = `${directory}/${name}.car`;
 
  let fileData = fs.readFileSync(path);
  console.log(fileData);
  try {
    let res = await axios.post(`https://upload.estuary.tech/content/add-car`, fileData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return res.data;
  } catch (err) {
    console.log(err.response?.data)
    console.log(`EstuaryJS(addFiles): Error status: ${err.response?.status}. Error code: ${err.code}. Error message: ${err.message}`);
    return err;
  }
 
};



export default {
  getPins,
  getPin,
  addPin,
  deletePin,
  getKeys,
  createKey,
  deleteKey,
  addFile,
  addFiles,
};
