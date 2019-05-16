/* eslint-disable no-undef,no-constant-condition */
const searchEngineURL = ($_CONFIG.BUMPPO_ENV_IS_PRODUCTION ?
  '$_CONFIG.BUMPPO_REMOTE_SERVER.origin' + '$_CONFIG.BUMPPO_REMOTE_SERVER.path':
  ('$_CONFIG.BUMPPO_LOCAL_SERVER' ?
    '$_CONFIG.BUMPPO_LOCAL_SERVER' : 'http://localhost:' +
    '$_CONFIG.BUMPPO_LOCAL_PORT' + '$_CONFIG.BUMPPO_REMOTE_SERVER.path'));
/* eslint-enable no-undef,no-constant-condition */

var xhr, searchData = { total: 0, sent: 0, inc: 30, results: [] };

/*eslint-disable-next-line no-unused-vars */
onmessage = (message) => {
  let [messageType, data] = message.data;
  if (messageType === 'query') {
    doAbort(xhr);
    doQuery(data);
  } else if (messageType === 'abort') {
    doAbort(xhr);
  }
};

function doAbort(xhr) {
  if (xhr) {
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
        let rawData = JSON.parse(xhr.responseText);
        searchData.sent = 0;
        searchData.total = rawData.results.length;
        searchData.results = rawData.results;
        postMessage(['status', 'Отрисовка результатов']);
        sendFirstResults();
      } else {
        postMessage(['error', `${ xhr.status } ${ xhr.statusText }`]);
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
  xhr.open('POST', searchEngineURL, asynchronously);
  xhr.send(data);
}

function sendFirstResults() {
  let firstResults = searchData.results.slice(0, searchData.inc);
  postMessage(['results0', {
    total: searchData.total,
    results: firstResults
  }]);
  searchData.sent = firstResults.length;
}
