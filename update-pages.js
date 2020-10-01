#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const TEMPLATE_MAP = "---\n\
categories: %s\n\
---\n\
{{< map >}}";
const TEMPLATE_PLAYER = "---\n\
---\n\
{{< player >}}";
const CONTENT_INDEX = "---\n\
bookHidden: true\n\
---";

(function()
{
    let mapId, content, map, dataFilePath, contentFilePath;
    
    let contentMapDir = path.join("content", "maps");
    let contentPlayerDir = path.join("content", "players");

    // Create the directories
    if (!fs.existsSync(contentMapDir))
    {
        fs.mkdirSync(contentMapDir);
    }

    if (!fs.existsSync(contentPlayerDir))
    {
        fs.mkdirSync(contentPlayerDir);
    }

    // Create the index files
    contentFilePath = path.join("content", "maps", "_index.md");
    fs.writeFileSync(contentFilePath, CONTENT_INDEX);

    contentFilePath = path.join("content", "players", "_index.md");
    fs.writeFileSync(contentFilePath, CONTENT_INDEX);

    let dataPath = path.join("data", "maps");
    let dataFiles = fs.readdirSync(dataPath);

    // Read map data files
    for (let i in dataFiles)
    {
        // Check map id validity
        dataFilePath = path.join("data", "maps", dataFiles[i]);
        mapId = parseInt(path.basename(dataFilePath, ".json"));
        if (isNaN(mapId))
        {
            continue;
        }

        // Read map data
        content = fs.readFileSync(dataFilePath);
        if (!content)
        {
            continue;
        }

        // Parse map data
        map = JSON.parse(content);
        if (!map)
        {
            continue;
        }

        // Skip removed maps
        if (map.category == "removed")
        {
            continue;
        }

        // Subcategories
        map.category = map.category.replace(/-/g, '/')

        // Create map page
        contentFilePath = path.join("content", "maps", mapId + ".md");
        fs.writeFileSync(contentFilePath, util.format(TEMPLATE_MAP, map.category));
        console.log(util.format("@%s is updated", mapId));
    }

    dataPath = path.join("data", "players");
    dataFiles = fs.readdirSync(dataPath);

    let playerName, player;

    // Read player data files
    for (let i in dataFiles)
    {
        // Check player name validity
        dataFilePath = path.join(dataPath, dataFiles[i]);
        playerName = path.basename(dataFilePath, ".json");
        if (!playerName || playerName.length < 3 || playerName.length > 32
            || playerName.indexOf(' ') != -1 || playerName.indexOf('#') == -1) // !playerName.match(/^\+?[a-z][a-z0-9_]+\#[0-9]{4}$/)
        {
            continue;
        }

        // Read player data
        content = fs.readFileSync(dataFilePath);
        if (!content)
        {
            continue;
        }

        // Parse player data
        player = JSON.parse(content);
        if (!map)
        {
            continue;
        }

        // Create player page
        contentFilePath = path.join("content", "players", playerName + ".md");
        fs.writeFileSync(contentFilePath, TEMPLATE_PLAYER);
        console.log(util.format("Player page %s is updated", playerName));
    }
})();

