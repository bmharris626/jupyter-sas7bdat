import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './request';

/**
 * Initialization data for the jupyter-sas7bdat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-sas7bdat:plugin',
  description: 'A JupyterLab extension for reading, writing, and converting SAS7BDAT files',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyter-sas7bdat is activated!');

    requestAPI<any>('hello', app.serviceManager.serverSettings)
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyter_sas7bdat server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
