import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import hypernova, { serialize, load } from 'hypernova';

export const renderReact = (name, component, store) => hypernova({
  server() {
    return (props) => {
      const comp = React.createElement(component, props);
      const promise = store.runSaga().done.then(() => {
        const contents = ReactDOMServer.renderToString(comp);
        return serialize(name, contents, props);
      });

      ReactDOMServer.renderToString(comp);
      store.close();

      return promise;
    };
  },

  client() {
    const payloads = load(name);

    if (payloads) {
      payloads.forEach((payload) => {
        const { node, data } = payload;
        const element = React.createElement(component, data);
        store.runSaga()

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
