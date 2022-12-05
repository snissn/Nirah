import styles from '@components/App.module.scss';
import axios from 'axios';
import * as React from 'react';
import * as Requests from '@common/requests';
import * as Utilities from '@common/utilities';
import { penumbra as penumbraFromLib } from '@transcend-io/penumbra';


import App from '@components/App';
import dynamic from 'next/dynamic';
import Example from '@root/components/test';

const FileUploader = dynamic(() => import('@components/FileUploader'), {ssr:false,});



function Home(props) {
  // NOTE(jim):
  // Fetch example
  React.useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api');
      const json = await response.json();
      console.log(json);
    }

    fetchData();
  }, []);

  

  return (
    <App title="Example" description="This is a website template" url="">
      <div className={styles.center}>
        <FileUploader />
      </div>
    </App>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {},
  };
}

export default Home;
