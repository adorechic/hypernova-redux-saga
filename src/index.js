import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import hypernova, { serialize, load } from 'hypernova';

export const renderReact = (name, component, store) => hypernova({
  server() {
    return (props) => {
      const element = React.createElement(component, props);
      const promise = store.runSaga().done.then(() => {
        const contents = ReactDOMServer.renderToString(element);
        const initialStateLoader = `<script type="text/javascript" charset="utf-8">window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())};</script>`
        return serialize(name, contents + initialStateLoader, props);
      });

      ReactDOMServer.renderToString(element);
      store.close();

      return promise;
    };
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
