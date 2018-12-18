import jQuery from 'jquery';
import ko from 'knockout';
import Plyr from 'plyr';

import cinematheque from '../video_data.js';

const plyrOpts = {
  debug: BUMPPO_ENV !== 'production', // eslint-disable-line no-undef
  controls: [],
  clickToPlay: false,
  fullscreen: { enabled: false, fallback: false, iosNative: false },
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
    this.element.css({ zIndex: -1000 });
  }
  createFilm(cinema, element) {
    let film = new Plyr(element, plyrOpts);
    film.filmObject = this;
    film.cinema = cinema;
    // NOTE: На плеере не стоит создавать дополнительный атрибут с element,
    // т.к. получить доступ к элементу можно через film.elements.container

    film.on('ready', event => {
      let film = event.detail.plyr;
      film.muted = true;
      film.rewind(0);
      film.play();
    });
    film.on('pause', () => {
      film.filmObject.deactivateIFrame();
      cinema.curtain.show();
      cinema.loader.hide();
    });
    film.on('seeking', () => {
      film.filmObject.deactivateIFrame();
      cinema.curtain.show();
      cinema.loader.show();
    });
    film.on('seeked', event => {
      let film = event.detail.plyr;
      if (!film.$hidden) {
        film.filmObject.activateIFrame();
        cinema.loader.hide();
        cinema.curtain.hide();
      }
    });

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
    return jQuery(this.screen).find('.bmpp-videoCurtain');
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
    if (!dataItem || recordId === null || !filmType) return;
    this.activeRecordId(recordId);
    this.activeFilmType(filmType);
    this.activeDataItem(dataItem);
    let begin = (dataItem.before? dataItem.before: dataItem.match).time.begin,
        end = (dataItem.after? dataItem.after: dataItem.match).time.end,
        film = this.getFilm(recordId, filmType).film;
    const cinema = this,
          logoHideTime = 0.8,
          logoFirstHideTime = 2.5,
          pauseFunction = event => {
            let p = event.detail.plyr;
            if (!p._playCount === 1) return;
            if (p.currentTime >= end - 1e-2) {
              p.muted = false;
              p.off('timeupdate', p._pauseFunction);
              delete p._pauseFunction;
              p.pause();
            } else if (p.currentTime >= begin - 1e-1) {
              delete p.$hidden;
              p.filmObject.activateIFrame();
              p.muted = false;
              cinema.loader.hide();
              cinema.curtain.hide();
            }
          };
    cinema.curtain.show();
    cinema.loader.show();
    begin /= 1000;
    end /= 1000;
    film.$hidden = true;
    if (film._playCount && film._playCount === 1) {
      film.currentTime = begin - logoFirstHideTime;
      film._playCount = 2;
    } else if (film._playCount && film._playCount > 1) {
      film.currentTime = begin - logoHideTime;
      film._playCount = 3;
    } else {
      film._playCount = 1;
      setTimeout(function () {
        cinema.showFilm(recordId, filmType, dataItem);
      }, 4000);
    }
    if (film._pauseFunction !== undefined) {
      film.off('timeupdate', film._pauseFunction);
    }
    film._pauseFunction = pauseFunction;
    film.on('timeupdate', film._pauseFunction);
    film.muted = true;
    film.play();
  }
  getFilm(recordId, filmType) {
    var key = recordId + filmType,
        film = key in this.films ?
          this.films[key] :
          new Film(this, { recordId: recordId, filmType: filmType });
    this.films[key] = film;
    this.hideAllBut(key);
    return film;
  }
  pauseAll() {
    let films = this.films;
    Object.keys(films).forEach(key => films[key].film.pause());
  }
  hideAllBut(showKey) {
    const films = this.films;
    Object.keys(films).forEach(key => {
      if (showKey === key) {
        films[key][showKey === key ? 'activateIFrame' : 'deactivateIFrame']();
      }
    });
  }
}

var cinema = new Cinema();

export default cinema;
