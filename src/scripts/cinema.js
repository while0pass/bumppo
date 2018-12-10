import jQuery from 'jquery';
import ko from 'knockout';
import Plyr from 'plyr';

import cinematheque from '../video_data.js';

const plyrOpts = {
  //debug: BUMPPO_ENV !== 'production', // eslint-disable-line no-undef
  controls: [],
  clickToPlay: false,
  fullscreen: { enabled: false, fallback: false, iosNative: false },
};


class Film {
  constructor(cinema, filmData) {
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

  <div id="${ elementId }">
    <iframe src="https://www.youtube.com/embed/${ filmId }?${ ytParams }"
      crossorigin></iframe>
  </div>
          `);
    cinema.screen.append(element);
    return element;
  }
  createFilm(cinema, element) {
    let film = new Plyr(element, plyrOpts);
    film.cinema = cinema;
    // NOTE: На плеере не стоит создавать дополнительный атрибут с element,
    // т.к. получить доступ к элементу можно через film.elements.container

    film.on('ready', event => {
      let film = event.detail.plyr;
      cinema.curtain.show();
      cinema.loader.hide();
      film.rewind(10);
      film.play();
    });
    film.on('pause', () => {
      cinema.curtain.show();
      cinema.loader.hide();
    });
    film.on('seeking', () => {
      cinema.curtain.show();
      cinema.loader.show();
    });
    film.on('seeked', event => {
      let film = event.detail.plyr;
      if (!film.$hidden) {
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
      { id: 'N-ey', disabled: true },
      { id: 'C-vi', disabled: false },
      { id: 'R-vi', disabled: false },
      { id: 'R-ey', disabled: true },
      { id: 'W-vi', disabled: false },
    ];
    this.activeRecordId = ko.observable(null);
    this.activeFilmType = ko.observable(null);
    this.activeDataItem = ko.observable(null);
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
  showFilm(recordId, filmType, dataItem) {
    if (!dataItem || recordId === null || !filmType) return;
    this.activeRecordId(recordId);
    this.activeFilmType(filmType);
    this.activeDataItem(dataItem);
    let { begin, end } = dataItem.time,
        film = this.getFilm(recordId, filmType).film;
    const cinema = this,
          logoHideTime = 0.8,
          logoFirstHideTime = 2,
          pauseFunction = event => {
            let p = event.detail.plyr;
            if (p.currentTime >= end - 1e-2) {
              p.muted = false;
              p.off('timeupdate', p._pauseFunction);
              delete p._pauseFunction;
              p.pause();
            } else if (p.currentTime >= begin - 1e-1) {
              delete p.$hidden;
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
    if (film._nonFirstPlay) {
      film.currentTime = begin - logoHideTime;
    } else {
      film.currentTime = begin - logoFirstHideTime;
      film._nonFirstPlay = true;
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
    let films = this.films;
    Object.keys(films).forEach(key => {
      films[key].element[key === showKey ? 'show' : 'hide']();
    });
  }
}

var cinema = new Cinema();

export default cinema;
