#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const TEMPLATE_MAP = "---\n\
categories: %s\n\
mapid: %d\n\
authors: %s\n\
---\n\
{{< map >}}";
const TEMPLATE_PLAYER = "---\n\
name: %s\n\
---\n\
{{< player >}}";
const CONTENT_INDEX = "---\n\
bookHidden: true\n\
---";

const toUpperCase = (str) => str.toUpperCase();
const capitalize = (name) => name.replace(/^[^a-z]*[a-z]/mi, toUpperCase);
const tagify = (name) => name.includes('#') ? name : name + '#0000';
const mousize = (name) => tagify(capitalize(name));

(function()
{
    let mapId, content, map, dataFilePath, contentFilePath;
    let mapAuthor = {};
    let authors = {};
    let authorsTemp = {};
    let playernames = {};
    
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

        // Add map to author's collection
        let authorTitle = map.author || "Unknown";
        let author = authorTitle.toLowerCase().replace("#", "-").replace("+", "-");
        mapAuthor[mapId] = author;
        authors[author] = {
            "url": author,
            "name": authorTitle,
        };
        authors[authorTitle] = authors[author];
        authorsTemp[authorTitle.toLowerCase()] = authors[author];

        // Skip removed maps
        if (map.category == "removed")
        {
            continue;
        }

        // Subcategories
        map.category = map.category.replace(/-/g, '/')

        // Create map page
        contentFilePath = path.join("content", "maps", mapId + ".md");
        fs.writeFileSync(contentFilePath, util.format(TEMPLATE_MAP, map.category, mapId, author));
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
        if (!player)
        {
            continue;
        }

        // Update player data
        if (player.maps) {
            player.mapsByAuthor = {};

            for (const mapid of player.maps) {
                const author = mapAuthor[mapid];
                player.mapsByAuthor[author] = player.mapsByAuthor[author] || [];
                player.mapsByAuthor[author].push(mapid);
            }
        }

        player.url = playerName.toLowerCase().replace("#", "-").replace("+", "-");
        player.name = mousize(playerName);
        playernames[player.url] = playerName;

        if (authorsTemp[playerName]) {
            player.isAuthor = true;
            authors[player.name].player = true;
        }

        fs.writeFileSync(dataFilePath, JSON.stringify(player));

        // Create player page
        contentFilePath = path.join("content", "players", player.url + ".md");
        fs.writeFileSync(contentFilePath, util.format(TEMPLATE_PLAYER, player.name));
        console.log(util.format("Player page %s is updated", playerName));
    }

    dataFilePath = path.join("data", "authors.json");
    fs.writeFileSync(dataFilePath, JSON.stringify(authors));
    console.log("Authors data updated");

    dataFilePath = path.join("data", "playernames.json");
    fs.writeFileSync(dataFilePath, JSON.stringify(playernames));
    console.log("Player names data updated");
})();

