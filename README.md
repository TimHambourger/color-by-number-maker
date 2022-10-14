# Color by Number Maker

A small front-end only web application for generating your own printable color-by-number coloring sheets. Inspired by
the kinds of coloring sheets available at [coloringsquared.com](https://www.coloringsquared.com/).

## How Do I Use This?

To get started generating your own color-by-number sheets, find an image online that you think would be cool to color,
right-click it and select **Copy Image** (your browser may call it something slightly different, but do make sure you're
doing **Copy Image** and *not* **Copy Image Link** or **Copy Image Address**). Then browse to
https://fierce-lake-96388.herokuapp.com and paste your image into the input box there. The app will guide you through
the rest of the steps for generating your printable coloring sheet.

Also, you don't *have* to start from images online. Copying an image file from your computer or opening an image and
selecting a region to copy works just fine too. Color by Number Maker works best on images that aren't too "busy" -- not
too many colors, not too many details, just a few key elements with high color contrast between them.

## Supported Browsers

For sure Firefox 105+ and Chrome 106+. Probably more, but those are where I've focused my attention.

## Running Locally

### Setting Up Development Environment
1. Clone this repository.
1. Install [NVM](https://github.com/nvm-sh/nvm#install--update-script).
1. From the root project directory, run `nvm install` to install the latest compatible versions of Node and NPM.
1. From the root project directory, run `npm install` to install project dependencies.

### Available Commands

Color by Number Maker was created with [Create React App](https://create-react-app.dev/), so many familiar commands are
available. Here's the full set.

#### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits. You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in interactive watch mode.

#### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the
build for best performance.

#### `npm run start:production`

Starts the production build. You must run `npm run build` first.

---
Copyright (c) 2022 Tim Hambourger
