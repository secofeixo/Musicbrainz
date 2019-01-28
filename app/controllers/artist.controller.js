/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const _ = require('lodash'),
  request = require('request-promise'),
  moment = require('moment'),
  logger = require('./log.controller.js');

const MAX_ATTEMPTS = 5;
const TIMEOUT_ATTEMPT = 1000;
const userAgent = 'bmat-test/0.0.2 (secofeixo@gmail.com)';

function getQueryParameterInt(queryObject, param) {
  let returnValue;
  if (_.has(queryObject, param)) {
    const paramInt = _.parseInt(queryObject[param]);
    if (!_.isNaN(paramInt)) {
      returnValue = paramInt;
    }
  }
  return returnValue;
}

function setTimeOutPromise(delay) {
  // logger.debug(`Timeout ${delay}`);
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

async function retryMusicBrainzAPI(options, numAttempts = MAX_ATTEMPTS, timeout = TIMEOUT_ATTEMPT) {
  let iAttempt = 0;
  let response;
  let error;
  while (iAttempt < numAttempts) {
    try {
      response = await request(options);
    } catch (err) {
      error = err;
      if (err.statusCode === 503) {
        await setTimeOutPromise(timeout);
      } else {
        break;
      }
    }
    iAttempt += 1;
  }

  if (!response) {
    logger.error('artist.controller. retryMusicBrainzAPI. Request exceeded.');
    throw error;
  }

  return response;
}

async function getAlbumsMusicBrainz(artist, limit, offset) {
  logger.debug(`atrist.controller. getAlbumsMusicBrainz. limit: ${limit}, offset: ${offset}`);

  const optionsLookup = {
    method: 'GET',
    url: 'https://musicbrainz.org/ws/2/release-group',
    qs: {
      artist,
      type: 'album',
      fmt: 'json',
      limit,
      offset,
    },
    headers: {
      'User-Agent': userAgent,
    },
  };

  let response;
  try {
    response = await retryMusicBrainzAPI(optionsLookup);
  } catch (err) {
    throw err;
  }

  response = JSON.parse(response);

  // logger.debug(`atrist.controller. getAlbumsMusicBrainz. response: ${JSON.stringify(response)}`);
  logger.debug('atrist.controller. getAlbumsMusicBrainz. finish');

  return response;
}

async function getReleaseCountMusicBrainzOfReleaseGroup(releaseGroup) {
  logger.debug(`atrist.controller. getReleaseCountMusicBrainzOfReleaseGroup. releaseGroup: ${releaseGroup}`);

  const options = {
    method: 'GET',
    url: 'https://musicbrainz.org/ws/2/release',
    qs: {
      'release-group': releaseGroup,
      fmt: 'json',
      limit: 1,
    },
    headers: {
      'User-Agent': userAgent,
    },
  };

  let response;
  try {
    response = await retryMusicBrainzAPI(options);
  } catch (err) {
    throw err;
  }

  response = JSON.parse(response);

  // logger.debug(`atrist.controller. getReleaseCountMusicBrainzOfReleaseGroup. response: ${JSON.stringify(response)}`);
  logger.debug(`atrist.controller. getReleaseCountMusicBrainzOfReleaseGroup. response: ${response['release-count']}`);

  return response['release-count'];
}

async function getReleaseCountMusicBrainzOfArtist(artist, limit = 100, offset = 0, finalReleaseCount = {}) {
  logger.debug(`atrist.controller. getReleaseCountMusicBrainzOfArtist. artist: ${artist}. offset: ${offset}, limit: ${limit}`);

  const optionsSearch = {
    method: 'GET',
    // url: 'https://musicbrainz.org/ws/2/release-group/',
    // qs: {
    //   query: `arid:${artist} AND type:album`,
    //   fmt: 'json',
    //   limit,
    //   offset,
    // },
    url: 'https://musicbrainz.org/ws/2/release',
    qs: {
      artist,
      type: 'album',
      fmt: 'json',
      limit,
      inc: 'release-groups',
      offset,
    },
    headers: {
      'User-Agent': userAgent,
    },
  };


  let response;
  try {
    response = await retryMusicBrainzAPI(optionsSearch);
  } catch (err) {
    throw err;
  }

  response = JSON.parse(response);

  // const finalResponse = response['release-groups'].map(rg => ({
  //   rgid: rg.id,
  //   'release-count': rg.count,
  // }));

  response.releases.forEach(release => {
    if (!_.has(finalReleaseCount, release['release-group'].id)) {
      finalReleaseCount[release['release-group'].id] = 0;
    }
    finalReleaseCount[release['release-group'].id] += 1;
  });

  return response['release-count'];

  // logger.debug(`atrist.controller. getReleaseCountMusicBrainzOfArtist. response: ${JSON.stringify(finalResponse)}`);

  // return finalResponse;
}

async function getAlbums(req, res) {
  req.setTimeout(500000);
  logger.debug(`event.controller. getAlbums. Artist: ${req.params.idArtist}`);

  let limit = getQueryParameterInt(req.query, 'limit');
  if (!limit) {
    limit = 50;
  } else if (limit <= 0) {
    limit = 50;
  } else if (limit > 150) {
    limit = 150;
  }

  let offset = getQueryParameterInt(req.query, 'offset');
  if (!offset) {
    offset = 0;
  }

  const finalResponse = {
    albums_count: 0,
    albums: [],
  };
  let limitQuery = limit;
  let offsetQuery = 0;
  const errors = [];

  // get the albums of the artist
  while (limitQuery > 0) {
    let response;
    try {
      response = await getAlbumsMusicBrainz(req.params.idArtist, limitQuery, offset + offsetQuery);
    } catch (err) {
      logger.error(`atrist.controller. getAlbums. Error getting release-groups from musicbrainz: ${JSON.stringify(err)}`);
      errors.push(err);
      response = undefined;
    }
    if (limitQuery > 100) {
      limitQuery -= 100;
      offsetQuery = 100;
    } else {
      limitQuery = 0;
    }
    if (response) {
      // logger.debug(`atrist.controller. getAlbums. response from musicbrainz: ${JSON.stringify(response)}`);
      finalResponse.albums_count = response['release-group-count'];

      const albumsFromResponse = response['release-groups'].map(elem => {
        const date = moment(elem['first-release-date']);
        let year = elem['first-release-date'];
        if (date.isValid()) {
          year = date.year();
        }

        return {
          id: elem.id,
          title: elem.title,
          year,
          release_count: -1,
        };
      });

      finalResponse.albums.push(...albumsFromResponse);
    }
  }

  if (_.has(req.query, 'one_by_one')) {
    // get for each album the number of release count.
    // for a maximum of limit 150 it makes 150 calls, and due to rate limit of musicbrainz it is not recommendable to use.
    const iNumAlbums = finalResponse.albums.length;
    for (let iIdxAlbum = 0; iIdxAlbum < iNumAlbums; iIdxAlbum += 1) {
      const albumObj = finalResponse.albums[iIdxAlbum];
      try {
        const iNum = await getReleaseCountMusicBrainzOfReleaseGroup(albumObj.id);
        albumObj.release_count = iNum;
      } catch (err) {
        errors.push(err);
      }
    }
  } else {
    // Get all release-counts of the artist.
    const releasesCount = {};
    const iNumReleases = await getReleaseCountMusicBrainzOfArtist(req.params.idArtist, 100, 0, releasesCount);
    for (let iIdxAlbum = 100; iIdxAlbum < iNumReleases; iIdxAlbum += 100) {
      try {
        await getReleaseCountMusicBrainzOfArtist(req.params.idArtist, 100, iIdxAlbum, releasesCount);
      } catch (err) {
        errors.push(err);
      }
    }

    logger.debug(`artist.controller. getAlbums. finalRG: ${JSON.stringify(releasesCount, null, 2)}`);

    // search the albums reponse of the artist searching the release_count of each album.
    const iNumAlbums = finalResponse.albums.length;
    for (let iIdxAlbum = 0; iIdxAlbum < iNumAlbums; iIdxAlbum += 1) {
      const albumObj = finalResponse.albums[iIdxAlbum];
      if (_.has(releasesCount, albumObj.id)) {
        albumObj.release_count = releasesCount[albumObj.id];
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      errors,
      finalResponse,
    });
    return;
  }

  res.status(200).json(finalResponse);
}

module.exports = {
  getAlbums,
};
