# Musicbrainz TEST

This project connects to musicbrainz API for getting all the albums with the number of raleases for each album of an artist.
It uses the next API of musicbrainz:
- For getting the albums of the users.
https://musicbrainz.org/ws/2/release-group?artist=idOfArtist&type=album&fmt=json
- For getting the number of releases of each album:
	- We can get the release count for each album, but with a limit of 100 albums in the main query, we need to do 100 queries to the Musicbrainz API. https://musicbrainz.org/ws/2/release?release-group=idAlbum&limit=1&fmt=json
	- In order to reduce this number of calls, we can get all the releases of an artist, and then do a matching process in order to get the correct number of releases for each album. https://musicbrainz.org/ws/2/release?artist=idOfArtist&type=album&fmt=json&inc=release-groups

So for a limit of 50 albums for getting the albums of the artist 65f4f0c5-ef9e-490c-aee3-909e7ae6b2ab we reduce the API calls from 51 or 52 api calls to:
- One or two calls for calling the albums
- And a máximum of 9 API calls for getting the releases, instead of 50 calls.
- Total: 10 o 11 API calls

# Environment

The test has been developed using NodeJS (8.12.0), and in a osx machine with OS Mojave (10.14.2).

# Running

The steps for running the test server are:

- Install nodeJS in your platform. https://nodejs.org/en/download/
- Unzip the file in a user folder.
- Run npm install, for installing all dependecies of the project
- npm run local

For running the client, you can use postman, and the api entry is:
Method: GET
URL: http://localhost:1337/artist/65f4f0c5-ef9e-490c-aee3-909e7ae6b2ab/albums
Query Parameters:

- offset [Number]. Setting the offset of the albums to get
- limit [Number]. Setting to get this máximum number of albums in each query.
- one_by_one: if it is specified with any value (the value does not matter, it is only important if the parameter is in the query or not) then the algorithm will do a query for each album for getting the release count. If it is not present then the release count is gotten using the query for getting all releases.
