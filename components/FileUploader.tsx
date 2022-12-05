import * as Estuary from '../estuary-js/dist/index.js';
import { penumbra as penumbraFromLib } from '@transcend-io/penumbra';
const penumbra = self.penumbra || penumbraFromLib;
import * as React from 'react';
import axios from 'axios';
import * as shortid from 'shortid';
declare global {
  interface FileList {
      forEach(callback: (f: File) => void) : void;
  }
}

export default function FileUploader(props) {
 
  const [selectedFile, setSelectedFile] = React.useState(null);

  
  

  let uploadFile = async (file: FileList) => {
    // console.log("hello");
    // const options = {
    //   key: 'test',
    // };
    // console.log("hello2");
    // const buffer = await file.arrayBuffer();
    // const stream = new Response(buffer).body;
    // const penumbraFile = {
    //   stream,
    //   size: file.size,
    // };

    // const encryptedFile = await penumbra.encrypt(options, penumbraFile);
    // console.log("hello3");
    const formData = new FormData();
    formData.append('id', shortid.generate());
    for (let i = 0; i < file.length; i++) {
      formData.append('files', file[i]);
    }

    const response = await axios.post('/api/addFiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  return (
    <React.Fragment>
      {/* <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={() => encryptFile(selectedFile)}>Encrypt</button> */}
      <input type="file" multiple onChange={(e) => setSelectedFile(e.target.files)} />
      <button onClick={() => uploadFile(selectedFile)}>Upload</button> 
      
    </React.Fragment>
  );
}
