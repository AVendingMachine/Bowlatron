# Bowlatron

An application for practicing Quizbowl Literature topics centered _you_ writing your own questions

- You input the clues
- Bowlatron makes the questions
- Centered around authors and works, may be expanded to other topics
- Has groundwork laid for there to be audio associated with each clue

## Installation

1. Go to [Releases](https://github.com/AVendingMachine/Bowlatron/releases)
2. Find the installer for your OS (just windows right now, I swear I will bundle it for other OSs soon)
3. Download and run that installer based on your operating system

### Windows

1. The .msi includes dependencies, the .exe does not, when in doubt download the .msi
2. If you get a "windows protected your pc" message, you can just run it anyways

## Dependencies

*Not exhaustive, all dependencies listed and not listed are licensed to their respective owners*

- [Tauri](https://github.com/tauri-apps/tauri) - Turns the web-app into a nice little desktop app
- [Tauri-SQL](https://github.com/tauri-apps/tauri-plugin-sql) - Allows tauri to interface with the SQLite database
- [Vue](https://github.com/vuejs) - Web framework used for the app
- [Vue-Select](https://github.com/sagalbot/vue-select) - Used for searchable dropdown menus

## TODO

1. ~~Finish database writer for all 4 tables (authors,works,questions A/W)~~
2. Create text-based system that displays hard-medium-easy clues in order with response system
3. Keep track of points using some kind of rating system, save locally
4. Make everything look nicer
5. Tidy up code mess (if possible)
6. Audio recording?? (design rest of project with this in mind but don't implement till later)
7. Possibly make the design more flexible so I can add more subjects (optional)
