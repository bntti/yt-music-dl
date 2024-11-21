# yt-music-dl

Downloads playlists from youtube, writes the song metadata and allows the user to manually input the song artists/titles. Currently a bit work in progress.

Metadata written:

-   `album`, playlist title
-   `cover image`, thumbnail of first video in playlist
-   `artist`, the program tries to guess the song artist but the user can input the correct one
-   `title`, the program tries to guess the song title but the user can input the correct one

## Running project

### Dependencies

-   ffmpeg
-   yt-dlp
-   node >= 22
-   yarn
-   mp3gain

### Initialization

1. Install dependencies
    ```
    yarn i
    ```
2. Init database
    ```
    yarn run init
    ```
3. Build the project
    ```
    yarn build
    ```
4. Run once to create config.json
    ```
    yarn start
    ```

### Running the program

```
yarn start
```

### Usage

| Command                            | Description                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `d \| download songs`              | Check the playlists for changes and download the new songs                                  |
| `r \| rename songs`                | Rename songs that have not been renamed yet                                                 |
| `c \| check for duplicate artists` | Prints artists that are similar to each other to check for typos                            |
| `e \| export renaming data`        | Export the user inputted artist-title pairs to `export.json`                                |
| `i \| import renaming data`        | Import the user inputted artist-title pairs from a `export.json` file in this projects root |
| `q \| quit`                        | Exit the program                                                                            |

### Configuration

The program is configured by editing `config.json`. This file is generated when you run the program for the first time.

| Variable        | Explanation                                                |
| --------------- | ---------------------------------------------------------- |
| `song_dir`      | Directory to download the songs to                         |
| `song_ext`      | Target song extension. Only tested value currently is .mp3 |
| `DBFS`          | Target dBFS to normalize songs to                          |
| `playlist_urls` | List of the URLs of the playlists                          |
