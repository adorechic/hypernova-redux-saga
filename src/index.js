import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import hypernova, { serialize, load } from 'hypernova';

export const renderReact = (name, component, store) => hypernova({
  server() {
    const promise = store.runSaga().done.then(() => {
      const contents = ReactDOMServer.renderToString(component);
      return serialize(name, contents, props);
    });

    ReactDOMServer.renderToString(component);
    store.close();

    return promise;
  },

  client() {
    store.runSaga();
    const payloads = load(name);

    if (payloads) {
      payloads.forEach((payload) => {
        const { node, data } = payload;
        const element = React.createElement(component, data);

        if (ReactDOM.hydrate) {
          ReactDOM.hydrate(element, node);
        } else {
          ReactDOM.render(element, node);
        }
      });
    }

    return component;
  },
});
