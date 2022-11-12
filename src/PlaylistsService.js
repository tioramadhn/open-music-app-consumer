const { Pool } = require("pg");
const AuthorizationError = require("./exceptions/AuthorizationError");
const NotFoundError = require("./exceptions/NotFoundError");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async getSongsInPlaylist(playlistId) {
    const query = {
      text: "SELECT playlists.id AS playlist_id, playlists.name, playlists.owner, songs.id AS song_id, songs.title, songs.performer FROM playlists JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id JOIN songs ON songs.id = playlist_songs.song_id WHERE playlists.id = $1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlists tidak ditemukan");
    }
    const rawData = result.rows;
    const { playlist_id: id, name } = rawData[0];

    const songs = rawData.map(({ song_id, title, performer }) => ({
      id: song_id,
      title,
      performer,
    }));

    return { id, name, songs };
  }
}

module.exports = PlaylistsService;
