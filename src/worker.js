/* eslint-disable no-undef,no-constant-condition */
const searchEngineURL = ($_CONFIG.BUMPPO_ENV_IS_PRODUCTION ?
  '$_CONFIG.BUMPPO_REMOTE_SERVER.origin' + '$_CONFIG.BUMPPO_REMOTE_SERVER.path':
  ('$_CONFIG.BUMPPO_LOCAL_SERVER' ?
    '$_CONFIG.BUMPPO_LOCAL_SERVER' : 'http://localhost:' +
    '$_CONFIG.BUMPPO_LOCAL_PORT' + '$_CONFIG.BUMPPO_REMOTE_SERVER.path'));

const notSameOrigin = self.location.origin !==
  (new URL('$_CONFIG.BUMPPO_REMOTE_SERVER.origin')).origin;
/* eslint-enable no-undef,no-constant-condition */

var xhr, searchData = { total: 0, sent: 0, inc: 30, results: [] },
    aborted = false;

/*eslint-disable-next-line no-unused-vars */
onmessage = (message) => {
  let [messageType, data] = message.data;
  if (messageType === 'query') {
    doAbort(xhr);
    doQuery(data);
  } else if (messageType === 'abort') {
    doAbort(xhr);
  } else if (messageType === 'results1') {
    sendOtherResults();
  }
};

function doAbort(xhr) {
  if (xhr) {
    aborted = true;
    setTimeout(function () { aborted = false; }, 2000);
    xhr.abort();
  }
}

function doQuery(data) {
  const NOT_SENT = 0,
        OPENED = 1,
        HEADERS_RECEIVED = 2,
        LOADING = 3,
        DONE = 4,
        asynchronously = true;
  xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === NOT_SENT) {
      postMessage(['status', 'Отправка запроса']);
    } else if (xhr.readyState === OPENED) {
      postMessage(['status', 'Ожидание ответа']);
    } else if (xhr.readyState === HEADERS_RECEIVED) {
      postMessage(['status', 'Ожидание данных']);
    } else if (xhr.readyState === LOADING) {
      postMessage(['status', 'Получение данных']);
    } else if (xhr.readyState === DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        postMessage(['status', 'Обработка данных']);
        postMessage(['noabort', null]);

        try {
          var rawData = JSON.parse(xhr.responseText);
        }
        catch (error) {
          let message = `Полученные данные не соответствуют
                         спецификации JSON: «${ error }».`;
          postMessage(['error', message]);
          return;
        }

        searchData.sent = 0;
        searchData.total = rawData.results.length;
        searchData.results = rawData.results;
        postMessage(['status', 'Отрисовка результатов']);
        sendFirstResults();
      } else {
        let message;
        if (xhr.status !== 0) {
          message = `${ xhr.status } ${ xhr.statusText }`;
        } else {
          message = 'Поисковый сервер недоступен';
          if (notSameOrigin) {
            message += ` или отвечает без учета <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
              target="_blank">политики CORS</a>`;
          }
          message += '.';
        }
        if (!aborted) {
          postMessage(['error', message]);
        }
      }
    }
  });
  xhr.upload.addEventListener('progress', event => {
    if (event.lengthComputable) {
      let percent = (event.loaded / event.total * 100).toFixed(0);
      if (percent < 100) {
        postMessage(['status', `Отправка данных ${ percent }%`]);
      }
    }
  });
  xhr.addEventListener('progress', event => {
    if (event.lengthComputable) {
      let percent = (event.loaded / event.total * 100).toFixed(0);
      if (percent < 100) {
        postMessage(['status', `Получение данных ${ percent }%`]);
      }
    }
  });
  xhr.addEventListener('abort', () => {
    postMessage(['status', 'Запрос отменен']);
  });
  // eslint-disable-next-line no-undef
  xhr.open('GET', searchEngineURL + '?data=' + encodeURIComponent(data),
    asynchronously);
  xhr.send();
  //xhr.open('POST', searchEngineURL, asynchronously);
  //xhr.send(data);
}

function sendFirstResults() {
  let firstResults = searchData.results.slice(0, searchData.inc);
  postMessage(['results0', {
    total: searchData.total,
    results: firstResults
  }]);
  searchData.sent = firstResults.length;
}

function sendOtherResults() {
  let { sent, inc, results } = searchData,
      resultsPortion = results.slice(sent, sent + inc);
  postMessage(['results1', resultsPortion]);
  searchData.sent += resultsPortion.length;
}
