import custom_io as io
from custom_io import CLEAR, LINE, OPTION, TITLE
from initialize_database import initialize_database
from phases import (
    check_playlists,
    check_similar_artists,
    download_songs,
    export_data,
    import_data,
    remove_orphans,
    rename_songs,
)
from repositories import song_repository

MENU_STR = f"""{LINE}------------------------------{CLEAR}
{OPTION}Downloaded songs{CLEAR}  | %s
{OPTION}Songs to rename  {CLEAR} | %s

{TITLE}What do you want to do?{CLEAR}
    {OPTION}u{CLEAR} | update playlists
    {OPTION}r{CLEAR} | rename songs
    {OPTION}c{CLEAR} | check for duplicate artists
    {OPTION}e{CLEAR} | export renaming data
    {OPTION}i{CLEAR} | import renaming data
    {OPTION}q{CLEAR} | quit
{LINE}------------------------------{CLEAR}"""


def main() -> None:
    """Run the program"""
    initialize_database()

    while True:
        print(MENU_STR % song_repository.get_nums())
        try:
            command = input("Command: ").lower()
        except EOFError:
            command = "q"

        if command == "u":
            check_playlists()
            download_songs()
            remove_orphans()
        elif command == "r":
            rename_songs()
        elif command == "c":
            check_similar_artists()
        elif command == "e":
            export_data()
        elif command == "i":
            import_data()
        elif command in ("q", ""):
            break
        else:
            io.warn("Invalid command %s", command)

        print()


if __name__ == "__main__":
    main()
