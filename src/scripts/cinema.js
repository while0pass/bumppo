import jQuery from 'jquery';
import ko from 'knockout';
import Plyr from 'plyr';

import cinematheque from '../video_data.js';

const plyrOpts = {
  debug: !$_CONFIG.BUMPPO_ENV_IS_PRODUCTION, // eslint-disable-line no-undef
  controls: [],
  clickToPlay: false,
  fullscreen: { enabled: false, fallback: false, iosNative: false },
  ratio: '16:9',
};


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
    const ytParams = 'modestbranding=1&showinfo=0&playsinline=1&enablejsapi=1',
          element = jQuery(`

  <div id="${ elementId }" style="position: absolute;">
    <iframe src="https://www.youtube.com/embed/${ filmId }?${ ytParams }"
      crossorigin></iframe>
  </div>
          `);

    jQuery(document.body).append(element);
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
    if (window[';)'].debugVideo) {
      this.element.css({ zIndex: 'auto' });
    } else {
      this.element.css({ zIndex: -1000 });
    }
  }
  createFilm(cinema, element) {
    let film = new Plyr(element, plyrOpts);
    film.filmObject = this;
    film.cinema = cinema;
    // NOTE: На плеере не стоит создавать дополнительный атрибут с element,
    // т.к. получить доступ к элементу можно через film.elements.container
    return film;
  }
}

class Cinema {
  constructor() {
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
    this.createHider();
  }
  get screen() {
    return jQuery('#bmpp-videoPlayer');
  }
  get curtain() {
    let element = jQuery(this.screen).find('.bmpp-videoCurtain');
    if (window[';)'].debugVideo) {
      element.hide();
      return jQuery();
    } else {
      return element;
    }
  }
  get loader() {
    return jQuery(this.screen).find('.bmpp-videoLoader');
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
            film.muted = false;
            if (film._pauseFunction !== undefined) {
              film.off('timeupdate', film._pauseFunction);
            }
            film._pauseFunction = pauseFunction;
            film.on('timeupdate', film._pauseFunction);
            film.play();
          };
    if (isCreated) {
      film.once('ready', play);
    } else {
      play();
    }
    cinema.curtain.hide();
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
  }
  hideAllBut(showKey) {
    const films = this.films;
    Object.keys(films).forEach(key => {
      let method = showKey === key ? 'activateIFrame' : 'deactivateIFrame';
      films[key][method]();
    });
  }
}

var cinema = new Cinema();

export default cinema;
