#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const TEMPLATE_MAP = "---\n\
categories: %s\n\
---\n\
{{< map >}}";
const CONTENT_INDEX = "---\n\
bookHidden: true\n\
---";

(function() {
    let mapId, content, map, dataFilePath, contentFilePath;
    
    // Create the directory
    let contentMapDir = path.join("content", "maps");
    if (!fs.existsSync(contentMapDir)){
        fs.mkdirSync(contentMapDir);
    }

    // Create index file
    contentFilePath = path.join("content", "maps", "_index.md");
    fs.writeFileSync(contentFilePath, CONTENT_INDEX);

    // Read data files
    let dataPath = path.join("data", "maps");
    let dataFiles = fs.readdirSync(dataPath);
    for (let i in dataFiles) {
        // Check map id validity
        dataFilePath = path.join("data", "maps", dataFiles[i]);
        mapId = parseInt(path.basename(dataFilePath, ".json"));
        if (isNaN(mapId)) {
            continue;
        }

        // Read map data
        content = fs.readFileSync(dataFilePath);
        if (!content) {
            continue;
        }

        // Parse map data
        map = JSON.parse(content);
        if (!map) {
            continue;
        }

        // Skip removed maps
        if (map.category == "removed") {
            continue;
        }

        // Create map page
        contentFilePath = path.join("content", "maps", mapId + ".md");
        fs.writeFileSync(contentFilePath, util.format(TEMPLATE_MAP, map.category));
        console.log(util.format("@%s is updated", mapId));
    }
})();

