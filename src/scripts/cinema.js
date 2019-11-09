import jQuery from 'jquery';
import ko from 'knockout';
import Plyr from 'plyr';

import cinematheque from '../video_data.js';

const plyrOpts = {
  clickToPlay: true,
  controls: ['play', 'current-time', 'mute', 'volume'],
  debug: !$_CONFIG.BUMPPO_ENV_IS_PRODUCTION, // eslint-disable-line no-undef
  invertTime: false,
  fullscreen: { enabled: false, fallback: false, iosNative: false },
  ratio: '16:9',
  //settings: ['speed'],
  //speed: { selected: 1, options: [0.5, 0.75, 1] },
};

//const performance = window.performance || window.Date;


class Film {
  constructor(cinema, filmData) {
    this.cinema = cinema;
    this.elementId = this.getElementId(cinema, filmData);
    this.filmId = this.getFilmId(filmData);
    this.element = this.createElement(cinema, this.elementId, this.filmId);
    this.film = this.createFilm(cinema, this.element);
  }
  getElementId(cinema, filmData) {
    return cinema.screen.attr('id') + filmData.recordId + filmData.filmType;
  }
  getFilmId(filmData) {
    return cinematheque[filmData.recordId][filmData.filmType];
  }
  createElement(cinema, elementId, filmId) {
    const self = this,
          element = jQuery(`

  <div id="${ elementId }" style="position: absolute; display: flex">
    <video>
      <source src="${ filmId }"></source>
    </video>
  </div>

          `);

    jQuery(document.body).append(element);
    element.on('mouseenter', () => {
      self.isMouseWithin = true;
    });
    element.on('mouseleave', () => {
      self.isMouseWithin = false;
      self.film && self.film.toggleControls(false);
    });
    return element;
  }
  activateIFrame() {
    let element = this.element,
        screen = this.cinema.screen;
    element.offset(screen.offset());
    element.width(screen.width());
    element.height(screen.height());
    element.css({ zIndex: 900 });
  }
  deactivateIFrame() {
    this.element.css({ zIndex: -1000 });
  }
  createFilm(cinema, element) {
    let self = this,
        film = new Plyr(element.find('video'), plyrOpts),
        showLoader = () => { cinema.loader.show(); },
        hideLoader = () => { cinema.loader.hide(); },
        animationFrame = null,
        placeCursor = () => {
          cinema.placeCursor(film.currentTime);
          animationFrame = window.requestAnimationFrame(placeCursor);
        },
        onPlay = () => {
          cinema.loader.hide();
          placeCursor();
        },
        onPause = () => {
          cinema.loader.hide();
          while (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
          }
        };
    film.toggleControls(false);
    showLoader();
    film.filmObject = this;
    film.cinema = cinema;
    film.on('stalled', showLoader);
    film.on('seeking', showLoader);
    film.on('waiting', showLoader);
    film.on('seeked', hideLoader);
    film.on('playing', onPlay);
    film.on('pause', onPause);
    film.on('controlsshown', () => {
      self.isMouseWithin || film.toggleControls(false);
    });
    return film;
  }
}

class Cinema {
  constructor(timeline) {
    this.films = {};
    this.filmTypes = [
      { id: 'N-eyf', disabled: true },
      { id: 'N-vi', disabled: false },
      { id: 'N-ey', disabled: false },
      { id: 'C-vi', disabled: false },
      { id: 'R-vi', disabled: false },
      { id: 'R-ey', disabled: false },
      { id: 'W-vi', disabled: false },
    ];
    this.activeRecordId = ko.observable(null);
    this.activeFilmType = ko.observable(null);
    this.activeDataItem = ko.observable(null);
    this.timeline = timeline;
    this.cursorStruct = this.createCursorStruct();
    this.createHider();
  }
  get screen() {
    if (!this._screen || this._screenNotInDOM) {
      this._screen = jQuery('#bmpp-videoPlayer');
      this._screenNotInDOM = false;
    }
    return this._screen;
  }
  get loader() {
    if (!this._loader || this._loaderNotInDOM) {
      this._loader = jQuery('#bmpp-videoLoader');
      this._loaderNotInDOM = false;
    }
    return this._loader;
  }
  hideCurtain() {
    let element = jQuery(this.screen).find('.bmpp-videoCurtain');
    element.css('z-index', 0);
  }
  createHider() {
    // Создаем шторку, за которой будут прятаться iframe'ы видео
    // во всех разделах кроме раздела с результатами
    jQuery(document.body).append(`<div style="position: absolute;
      top: 0; left: 0; bottom: 0; right: 0; background-color: #fff;
      z-index: -800;"></div>`);
  }
  clearActiveState() {
    this.activeRecordId(null);
    this.activeFilmType(null);
    this.activeDataItem(null);
  }
  createCursorStruct() {
    let struct = {
      width: 0,
      start: 0,
      duration: 1,
      //lastTime: performance.now(),
    };
    ko.computed(function () {
      let timeline = this.timeline();
      if (timeline) {
        struct.width = timeline.canvasWidth();
        struct.start = timeline.layersStruct.time.start;
        struct.duration = timeline.layersStruct.duration;
      }
    }, this);
    return struct;
  }
  placeCursor(currentTime) {
    // Ограничимся 25 кадрами в сек.
    //let lastTime = this.cursorStruct.lastTime,
    //    thisTime = performance.now();
    //if (thisTime - lastTime < 40) return;
    //this.cursorStruct.lastTime = thisTime;

    let cursor = this.cursorStruct.cursor;
    if (!cursor) cursor = document.getElementById('bmpp-cursor');
    // NOTE: Нет смысла брать элемент DOM для курсора в createCursorStruct,
    // т.к. на тот момент элемента ещё в DOM не будет.

    let { start, width, duration } = this.cursorStruct,
        position = (currentTime * 1000 - start) / duration * width;
    cursor.setAttribute('x1', position);
    cursor.setAttribute('x2', position);
  }
  showFilm(recordId, filmType, dataItem) {
    const cinema = this;
    if (!dataItem || recordId === null || !filmType) return;
    cinema.pauseAll();
    cinema.activeRecordId(recordId);
    cinema.activeFilmType(filmType);
    cinema.activeDataItem(dataItem);
    let begin = (dataItem.before? dataItem.before: dataItem.match).time.begin,
        end = (dataItem.after? dataItem.after: dataItem.match).time.end,
        [film, isCreated] = cinema.getFilm(recordId, filmType);
    film = film.film;
    begin /= 1000;
    end /= 1000;

    const pauseFunction = event => {
            let p = event.detail.plyr;
            if (p.currentTime >= end - 1e-2) {
              p.off('timeupdate', p._pauseFunction);
              delete p._pauseFunction;
              p.pause();
            }
          },
          play = () => {
            film.currentTime = begin;
            if (film._pauseFunction !== undefined) {
              film.off('timeupdate', film._pauseFunction);
            }
            film._pauseFunction = pauseFunction;
            film.on('timeupdate', film._pauseFunction);
            film.play();
          };
    if (isCreated) {
      film.once('loadedmetadata', play);
    } else {
      play();
    }
    cinema.hideCurtain();
  }
  getFilm(recordId, filmType) {
    const key = recordId + filmType,
          isAvailable = key in this.films,
          isCreated = !isAvailable,
          film = isAvailable ? this.films[key] :
            new Film(this, { recordId: recordId, filmType: filmType });
    this.films[key] = film;
    this.hideAllBut(key);
    return [film, isCreated];
  }
  pauseAll() {
    let films = this.films;
    Object.keys(films).forEach(key => {
      films[key].film.pause();
    });
  }
  deactivateAll() {
    let films = this.films;
    Object.keys(films).forEach(key => {
      films[key].film.pause();
      films[key].deactivateIFrame();
    });
    this._screenNotInDOM = true;
    this._loaderNotInDOM = true;
  }
  hideAllBut(showKey) {
    const films = this.films;
    Object.keys(films).forEach(key => {
      let method = showKey === key ? 'activateIFrame' : 'deactivateIFrame';
      films[key][method]();
    });
  }
}

export default Cinema;
