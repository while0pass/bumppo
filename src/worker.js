import stubResultsData from './response_data_new2.json';
import stubTiersData from './response_tiers3.json';

/* eslint-disable no-undef,no-constant-condition */
const searchEngineURL = ($_CONFIG.BUMPPO_ENV_IS_PRODUCTION
  ? '$_CONFIG.BUMPPO_REMOTE_SERVER.origin'
  : ('$_CONFIG.BUMPPO_LOCAL_SERVER'
    ? '$_CONFIG.BUMPPO_LOCAL_SERVER'
    : 'http://localhost:' + '$_CONFIG.BUMPPO_LOCAL_PORT'));

const resultsURL = searchEngineURL + '$_CONFIG.BUMPPO_REMOTE_SERVER.resultsPath',
      tiersURL = searchEngineURL + '$_CONFIG.BUMPPO_REMOTE_SERVER.tiersPath';

const notSameOrigin = self.location.origin !==
  (new URL('$_CONFIG.BUMPPO_REMOTE_SERVER.origin')).origin;
/* eslint-enable no-undef,no-constant-condition */

const mainQueryType = 'results'; // 'results' vs. 'layers'

var xhr,
    resultsData = { total: 0, results: [] },
    aborted = false,
    useStubData = false;

onmessage = message => {
  let [messageType, data] = message.data;
  if (messageType === 'stub') {
    useStubData = true;
  } else if (messageType === 'query') {
    let isMainQueryType = data.type === mainQueryType,
        doUseStubData = useStubData
          && (isMainQueryType || data.query === 'stub');
    if (!doUseStubData) {
      doAbort(xhr);
      doQuery(data);
    } else {
      getStubResults(data.type);
    }
  } else if (messageType === 'abort') {
    doAbort(xhr);
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
  const { type: queryType, query: queryJSON } = data,
        isMainType = queryType === mainQueryType,
        xURL = isMainType ? resultsURL : tiersURL;

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
        } catch (error) {
          let message = `Полученные данные не соответствуют
                         спецификации JSON: «${ error }».`;
          postMessage(['error', message]);
          return;
        }

        if (rawData.error) {
          postMessage(['error', rawData.error]);
          return;
        }

        if (isMainType) {
          resultsData.total = rawData.results.length;
          resultsData.results = rawData.results;
          postMessage(['status', 'Отрисовка результатов']);
          postMessage(['results', resultsData]);
          postMessage(['status', null]);
        } else {
          postMessage(['layers', { data: rawData, tiers: data.tiers || [] }]);
        }
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
    postMessage(['aborted', null]);
  });
  //xhr.open('GET', xURL + '?data=' + encodeURIComponent(queryJSON),
  //  asynchronously);
  //xhr.send();
  let formData = new FormData();
  formData.append('data', queryJSON);
  xhr.open('POST', xURL, asynchronously);
  xhr.send(formData);
}

function getStubResults(dataType) {
  if (dataType === mainQueryType) {
    resultsData.total = stubResultsData.results.length;
    resultsData.results = stubResultsData.results;
    postMessage(['status', 'Отрисовка результатов']);
    postMessage(['results', resultsData]);
    postMessage(['status', null]);
  } else {
    postMessage(['layers', { data: stubTiersData, tiers: [] }]);
  }
}
