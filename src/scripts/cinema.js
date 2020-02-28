import jQuery from 'jquery';
import ko from 'knockout';
import Plyr from 'plyr';

import cinematheque from '../video_data.js';

var plyrOpts = {
  clickToPlay: true,
  controls: ['play', 'current-time', 'mute', 'volume', 'fullscreen', 'settings'],
  debug: false && !$_CONFIG.BUMPPO_ENV_IS_PRODUCTION, // eslint-disable-line no-undef
  invertTime: false,
  fullscreen: { enabled: true, fallback: true, iosNative: false },
  ratio: '16:9',
  settings: ['speed'],
  speed: { selected: 1, options: [0.5, 0.75, 1] },
};

//const performance = window.performance || window.Date;


class Film {
  constructor(cinema, filmData) {
    this.cinema = cinema;
    this.elementId = this.getElementId(cinema, filmData);
    this.filmId = this.getFilmId(filmData);
    this.element = this.createElement(cinema, this.elementId, this.filmId);
    this.film = this.createFilm(cinema, this.element);
    this.episode = { begin: 0, end: 86400 };
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

    jQuery(cinema.screen).append(element);
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
    this.element.css({ zIndex: 900 });
  }
  deactivateIFrame() {
    this.element.css({ zIndex: -1000 });
  }
  getPlyrOpts(cinema) {
    if (plyrOpts.listeners === undefined) {
      plyrOpts.listeners = {
        play: function () {
          const recordId = cinema.activeRecordId(),
                filmType = cinema.activeFilmType(),
                film = cinema.getFilm(recordId, filmType)[0];
          if (film.film.playing) {
            cinema._isFilmPausedByUser = true;
          } else if (film.film.paused && cinema._isFilmPausedByUser) {
            cinema._isFilmPausedByUser = false;
          } else {
            const prepareInsteadOfShow = true;
            cinema.play(prepareInsteadOfShow);
          }
        }
      };
    }
    return plyrOpts;
  }
  createFilm(cinema, element) {
    let self = this,
        plyrOpts = this.getPlyrOpts(cinema),
        film = new Plyr(element.find('video'), plyrOpts),
        showLoader = () => { cinema.loader.show(); },
        hideLoader = () => { cinema.loader.hide(); },
        animationFrame = null,
        lastEnd = 0,
        placeCursor = () => {
          let time = film.currentTime;
          cinema.placeCursor(time);
          if (time - self.episode.end > 0 || self.episode.begin - time > 1e-3) {
            lastEnd = self.episode.end;
            film.pause();
            self.episode.begin = 0;
            self.episode.end = film.duration;
            return;
          }
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
          // Поправляем курсор, если он немного проскочил отметку паузы
          if (lastEnd > 0) {
            let delta = film.currentTime - lastEnd;
            if (delta > 0 && delta < 0.5) cinema.placeCursor(lastEnd);
            lastEnd = 0;
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

const PLAY_CSS_CLASS = 'play',
      PAUSE_CSS_CLASS = 'pause';

const playTypes = {
  PLAY_SELECTION: Symbol('play selection'),
  PLAY_PRE_SELECTION: Symbol('play pre selection'),
  PLAY_POST_SELECTION: Symbol('play post selection'),
  PLAY_VISIBLE: Symbol('play visible'),
};

class Cinema {
  constructor(timeline) {
    this.films = {};
    this.filmTypes = [
      { id: 'N-vi', disabled: false, title: 'Индивидуальное видео Рассказчика' },
      { id: 'N-ey', disabled: false, title: 'Видео с айтрекера Рассказчика' },
      { id: 'C-vi', disabled: false, title: 'Индивидуальное видео Комментатора' },
      { id: 'R-vi', disabled: false, title: 'Индивидуальное видео Пересказчика' },
      { id: 'R-ey', disabled: false, title: 'Видео с айтрекера Пересказчика' },
      { id: 'W-vi', disabled: false, title: 'Видео общего плана' },
    ];
    this.activeRecordId = ko.observable(null);
    this.activeFilmType = ko.observable(null);
    this.activeDataItem = ko.observable(null);
    this.canPlayOrPause = ko.observable(PLAY_CSS_CLASS);
    this.playType = ko.observable(playTypes.PLAY_SELECTION);
    this.playTypes = playTypes;
    this.timeline = timeline;
    this.cursorStruct = this.createCursorStruct();
  }
  get screen() {
    if (!this._screen) this._screen = jQuery('#bmpp-videoPlayer');
    return this._screen;
  }
  get loader() {
    if (!this._loader) this._loader = jQuery('#bmpp-videoLoader');
    return this._loader;
  }
  hideCurtain() {
    let element = jQuery(this.screen).find('.bmpp-videoCurtain');
    element.css('z-index', 0);
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
      let layersStruct = this.timeline.layersStruct(),
          width = this.timeline.canvasWidth && this.timeline.canvasWidth() || 0;
      struct.width = width;
      struct.start = layersStruct.time.start;
      struct.duration = layersStruct.duration;
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
        position = width
          ? String((currentTime * 1000 - start) / duration * 100) + '%'
          : -100;
    cursor.setAttribute('x1', position);
    cursor.setAttribute('x2', position);
  }
  _play(film, isCreated, begin, end) {
    film.episode.begin = begin;
    film.episode.end = end;
    film = film.film;
    if (isCreated) {
      film.once('loadedmetadata', function () {
        film.currentTime = begin;
        film.play();
      });
    } else {
      film.currentTime = begin;
      film.play();
    }
    this._isFilmPausedByUser = false;
    this.hideCurtain();
  }
  play(prepareInsteadOfShow=false) {
    var xStart, xEnd,
        method = prepareInsteadOfShow ? 'prepareEpisode' : 'showEpisode',
        winStart = this.timeline.getWindowStart(),
        winEnd = this.timeline.getWindowEnd(),
        [selStart, selEnd] = this.timeline.selectionEdges();
    switch (this.playType()) {
    case playTypes.PLAY_SELECTION:
      [xStart, xEnd] = [selStart || winStart, selEnd || winEnd];
      break;
    case playTypes.PLAY_PRE_SELECTION:
      [xStart, xEnd] = [winStart, selStart || winEnd];
      break;
    case playTypes.PLAY_POST_SELECTION:
      [xStart, xEnd] = [selEnd || winStart, winEnd];
      break;
    case playTypes.PLAY_VISIBLE:
      [xStart, xEnd] = [winStart, winEnd];
    }
    this[method](xStart, xEnd);
  }
  playOrPause() {
    let recordId = this.activeRecordId(),
        filmType = this.activeFilmType();
    if (recordId && filmType) {
      let [film, isCreated] = this.getFilm(recordId, filmType);
      if (film.film.playing && !isCreated) {
        this._isFilmPausedByUser = true;
        film.film.pause();
      } else if (film.film.paused && this._isFilmPausedByUser && !isCreated) {
        this._isFilmPausedByUser = false;
        film.film.play();
      } else {
        this.play();
      }
    }
  }
  showFilm(recordId, filmType, dataItem) {
    const cinema = this;
    if (!dataItem || recordId === null || !filmType) return;
    cinema.pauseAll();
    cinema.activeRecordId(recordId);
    cinema.activeFilmType(filmType);
    cinema.activeDataItem(dataItem);
    // FIXME: Убрать костыли для разных версий dataItem, когда новая
    // версия устаканится.
    let begin = (dataItem.before? dataItem.before: dataItem.match).time.begin,
        end = (dataItem.after? dataItem.after: dataItem.match).time.end,
        [film, isCreated] = cinema.getFilm(recordId, filmType);
    begin /= 1000;
    end /= 1000;
    cinema._play(film, isCreated, begin, end);
  }
  showAlternativeFilm(recordId, filmType, dataItem) {
    const cinema = this;
    if (!dataItem || recordId === null || !filmType) return;
    cinema.pauseAll();
    cinema.activeRecordId(recordId);
    cinema.activeFilmType(filmType);
    cinema.activeDataItem(dataItem);
    cinema.play();
  }
  prepareEpisode(begin, end) {
    if (this._isFilmPausedByUser) {
      this._isFilmPausedByUser = false;
      return;
    }
    let recordId = this.activeRecordId(),
        filmType = this.activeFilmType();
    if (recordId && filmType) {
      let [film, isCreated] = this.getFilm(recordId, filmType);
      begin /= 1000;
      end /= 1000;
      let isBeginChanged = Math.abs(film.episode.begin - begin) > 1e-3,
          isEndChanged = Math.abs(film.episode.end - end) > 1e-3;
      if (isBeginChanged) film.episode.begin = begin;
      if (isEndChanged) film.episode.end = end;
      film = film.film;
      if (isCreated) {
        film.once('loadedmetadata', function () {
          film.currentTime = begin;
        });
      } else {
        if (isBeginChanged) {
          film.currentTime = begin;
        }
      }
    }
  }
  showEpisode(begin, end) {
    let recordId = this.activeRecordId(),
        filmType = this.activeFilmType();
    if (recordId && filmType) {
      let [film, isCreated] = this.getFilm(recordId, filmType);
      begin /= 1000;
      end /= 1000;
      this._play(film, isCreated, begin, end);
    }
  }
  seek(timePoint) {
    let recordId = this.activeRecordId(),
        filmType = this.activeFilmType();
    if (recordId && filmType) {
      let film = this.getFilm(recordId, filmType)[0];
      timePoint /= 1000;
      film.film.currentTime = timePoint;
      this.placeCursor(timePoint);
    }
  }
  getFilm(recordId, filmType) {
    const key = recordId + filmType,
          isAvailable = key in this.films,
          isCreated = !isAvailable,
          film = isAvailable ? this.films[key] :
            new Film(this, { recordId: recordId, filmType: filmType });
    this.films[key] = film;
    this.hideAllBut(key);
    if (isCreated) {
      let cinema = this;
      film.film.on('play', () => {
        cinema.canPlayOrPause(PAUSE_CSS_CLASS);
      });
      film.film.on('pause', () => {
        cinema.canPlayOrPause(PLAY_CSS_CLASS);
      });
    }
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

export default Cinema;
