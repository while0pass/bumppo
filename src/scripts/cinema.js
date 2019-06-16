import dashjs from 'dashjs';
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


class Film {
  constructor(cinema, filmData) {
    this.cinema = cinema;
    this.elementId = this.getElementId(cinema, filmData);
    [this.filmId, this.isDash] = this.getFilmId(filmData);

    if (this.isDash && cinema.dashElement) {
      this.element = cinema.dashElement;
    } else {
      this.element = this.createElement(cinema, this.elementId, this.filmId);
      if (this.isDash) cinema.dashElement = this.element;
    }

    if (this.isDash) {
      if (cinema.dash) {
        cinema.changeDashSource(this.filmId);
      } else {
        cinema.initDash(this.filmId, this.element);
      }
    }

    if (this.isDash && cinema.dashPlyr) {
      this.film = cinema.dashPlyr;
    } else {
      this.film = this.createFilm(cinema, this);
      if (this.isDash) cinema.dashPlyr = this.film;
    }
  }
  getElementId(cinema, filmData) {
    return cinema.screen.attr('id') + filmData.recordId + filmData.filmType;
  }
  getFilmId(filmData) {
    let filmId = cinematheque[filmData.recordId][filmData.filmType],
        isDash = filmId.slice(-4).toLowerCase() === '.mpd';
    return [filmId, isDash];
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
  createFilm(cinema, filmContainer) {
    let film = new Plyr(filmContainer.element.find('video'), plyrOpts),
        showLoader = () => { cinema.loader.show(); },
        hideLoader = () => { cinema.loader.hide(); };
    film.toggleControls(false);
    showLoader();
    film.cinema = cinema;
    film.on('stalled', showLoader);
    film.on('seeking', showLoader);
    film.on('waiting', showLoader);
    film.on('seeked', hideLoader);
    film.on('playing', hideLoader);
    film.on('controlsshown', () => {
      filmContainer.isMouseWithin || film.toggleControls(false);
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
  initDash(filmId, element) {
    const videoElement = element.find('video').get(0),
          dash = dashjs.MediaPlayer().create(),
          NO_AUTO_PLAY = false;
    dash.initialize(videoElement, filmId, NO_AUTO_PLAY);
    //dash.setLiveDelay(1);
    //dash.setLowLatencyEnabled(true);
    this.dash = dash;
  }
  changeDashSource(filmId) {
    this.dash.attachSource(filmId);
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
        [film, isCreatedOrDashSourceChange] = cinema.getFilm(recordId, filmType);
    film = film.film;
    begin /= 1000;
    end /= 1000;

    function pauseFunction(event) {
      let p = event.detail.plyr;
      if (p.currentTime >= end - 1e-2) {
        p.off('timeupdate', p._pauseFunction);
        delete p._pauseFunction;
        p.pause();
      }
    }

    //function clearFallback() {
    //  if (film._fallback !== undefined) {
    //    clearTimeout(film._fallback);
    //    film.off('playing', clearFallback);
    //  }
    //}

    //function setFallback() {
    //  const waitInterval = 1000;
    //  clearFallback();
    //  film._fallback = setTimeout(play, waitInterval);
    //  film.on('playing', clearFallback);
    //}

    function play() {
      film.currentTime = begin;
      if (film._pauseFunction !== undefined) {
        film.off('timeupdate', film._pauseFunction);
      }
      film._pauseFunction = pauseFunction;
      film.on('timeupdate', film._pauseFunction);
      //setFallback();
      film.play();
    }

    if (isCreatedOrDashSourceChange) {
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
            new Film(this, { recordId: recordId, filmType: filmType }),
          isDashSourceChanged = film.isDash && isAvailable
            && this.dash.getSource() !== film.filmId;
    this.films[key] = film;
    if (isDashSourceChanged) {
      cinema.changeDashSource(film.filmId);
    }
    this.hideAllBut(key);
    return [film, isCreated || isDashSourceChanged];
  }
  pauseAll() {
    let films = this.films;
    if (this.dash) this.dash.pause();
    Object.keys(films).forEach(key => {
      films[key].film.pause();
    });
  }
  deactivateAll() {
    let films = this.films;
    if (this.dash) this.dash.pause();
    Object.keys(films).forEach(key => {
      films[key].film.pause();
      films[key].deactivateIFrame();
    });
    this._screenNotInDOM = true;
    this._loaderNotInDOM = true;
  }
  hideAllBut(showKey) {
    const films = this.films,
          showDash = films.hasOwnProperty(showKey) && films[showKey].isDash;
    Object.keys(films).forEach(key => {
      let film = films[key],
          method = showKey === key ? 'activateIFrame' : 'deactivateIFrame';
      if (!showDash || showKey === key || !film.isDash) {
        film[method]();
      }
    });
  }
}

var cinema = new Cinema();

export default cinema;
