# Site Parser Config Generator Chrome Extension

This Chrome extension helps you generate JSON configuration for site parsing by providing a user-friendly interface in Chrome DevTools. The extension allows you to visually select elements on web pages and configure parsing rules for catalogs and posts.

## Features

- Visual element selector for CSS selectors
- Support for nested catalog structures
- Post configuration with catalog references
- Field configuration with attributes and regex filters
- Real-time JSON preview
- JSON download functionality
- Integration with Chrome DevTools

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Open Chrome DevTools (F12 or Right-click > Inspect)
2. Find the "Parser Config" tab in DevTools
3. Enter the main URL for the site you want to parse
4. Add catalogs and posts as needed:
   - Click "Add Catalog" or "Add Post" to create new entries
   - Use the "Select" buttons to visually select elements on the page
   - Configure fields, selectors, and other properties
5. Preview the generated JSON in real-time
6. Click "Download JSON" to save the configuration

## Configuration Structure

### Catalog Configuration
- `name`: Name of the catalog
- `fields`: Array of fields to extract
- `childCatalogName`: Name of the child catalog (if any)
- `linkSelector`: CSS selector for catalog item links
- `childPostName`: Name of the child post type (if any)
- `isMain`: Boolean indicating if this is the main catalog
- `paginationLinkSelector`: CSS selector for pagination links

### Post Configuration
- `name`: Name of the post type
- `fields`: Array of fields to extract
- `linkSelector`: CSS selector for post links
- `paginationLinkSelector`: CSS selector for pagination links
- `catalogs`: Array of catalog references

### Field Configuration
- `name`: Name of the field
- `valueSelector`: CSS selector for the value
- `valueAttribute`: Attribute to extract (empty for text content)
- `nameSelector`: CSS selector for the field name
- `nameAttribute`: Attribute to extract for the name
- `regexFilter`: Regular expression to filter/transform the value
- `fields`: Array of nested fields

## Development

The extension is built using vanilla JavaScript and follows Chrome Extension Manifest V3 guidelines. The main components are:

- `manifest.json`: Extension configuration
- `devtools.html/js`: DevTools panel initialization
- `panel.html/js`: Main interface and logic
- `content.js`: Content script for element selection
- `background.js`: Background script for message handling
- `styles.css`: UI styling
