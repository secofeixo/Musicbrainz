const ctrlArtist = require('../controllers/artist.controller');

module.exports = app => {
  app.route('/artist/:idArtist/albums').get(ctrlArtist.getAlbums);
};
