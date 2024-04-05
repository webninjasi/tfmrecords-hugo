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

function fixDiscordURL(url) {
    return '//wsrv.nl/?url=' + encodeURIComponent(url.replace(/\?.+$/m, '').replace('.discordapp.com', '.discordapp.xyz').replace(/^https?:\/\//mi, ''));
}

(function()
{
    let mapId, content, map, dataFilePath, contentFilePath;
    let mapAuthor = {};
    let authors = {};
    let authorsTemp = {};
    let playernames = {};
    let stats = [];
    let statCategories = {};
    let categories = {};
    let firstInMap = {};
    
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

    let dataPath, dataFiles;

    dataPath = path.join("data", "categories");
    dataFiles = fs.readdirSync(dataPath);

    for (let i in dataFiles)
    {
        dataFilePath = path.join("data", "categories", dataFiles[i]);
        let categoryName = path.basename(dataFilePath, ".json");

        content = fs.readFileSync(dataFilePath);
        if (!content)
        {
            continue;
        }

        const category = JSON.parse(content);
        if (!category)
        {
            continue;
        }

        categories[categoryName] = category;
    }

    for (const categoryName in categories) {
        dataFilePath = path.join("data", "categories", categoryName + ".json");
        const category = categories[categoryName];

        if (categoryName.includes('-') && categories[category.parent]) {
            category.fullTitle = categories[category.parent].title + " " + category.title;
        } else {
            category.fullTitle = category.title;
        }

        fs.writeFileSync(dataFilePath, JSON.stringify(category));
        console.log(util.format("Category %s is updated", categoryName));
    }

    dataPath = path.join("data", "maps");
    dataFiles = fs.readdirSync(dataPath);

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

        // Update image url
        if (map.img.indexOf('discord') != -1) {
            map.img = fixDiscordURL(map.img);

            var recs;
            recs = map.records;
            for (var i=0; i<recs.length; i++) {
                if (recs[i]?.proof?.indexOf('discord') != -1) {
                    recs[i].proof = fixDiscordURL(recs[i].proof);
                }
            }
            recs = map.recordsReversed;
            for (var i=0; i<recs.length; i++) {
                if (recs[i]?.proof?.indexOf('discord') != -1) {
                    recs[i].proof = fixDiscordURL(recs[i].proof);
                }
            }
    
            // Save map data file
            fs.writeFileSync(dataFilePath, JSON.stringify(map));
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
        map.category = map.category.replace(/-/g, '/');

        let pname;
        pname = map.records[0]?.name;
        if (pname) {
            firstInMap[pname] = firstInMap[pname] || [];
            firstInMap[pname].push(mapId);
        }

        pname = map.recordsReversed[0]?.name;
        if (pname) {
            firstInMap[pname] = firstInMap[pname] || [];
            firstInMap[pname].push(mapId);
        }

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

        const firsts = player.firsts || {};
        const completions = player.completions || {};
        const total = {
            firsts: Object.keys(firsts).reduce(
                (ret, key) => key == "removed" ? ret : ret + firsts[key], 0
            ),
            completions: Object.keys(completions).reduce(
                (ret, key) => key == "removed" ? ret : ret + completions[key], 0
            ),
        };
        Object.keys(player.completions).map(cat => statCategories[cat] = true);

        player.total = total;
        player.firstInMap = firstInMap[playerName];

        stats.push({
            url: player.url,
            name: player.name,
            firsts,
            completions,
            total,
        });

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

    const inLeaderboard = {};

    function sortFilterStats(f) {
        stats.sort(f);

        for (let i = 0; i < 10; i ++) {
            if (!stats[i]) {
                return;
            }

            inLeaderboard[stats[i].name] = true;
        }
    }

    sortFilterStats((a, b) => b.total.firsts - a.total.firsts);
    sortFilterStats((a, b) => b.total.completions - a.total.completions);

    const statCategoryList = Object.keys(statCategories);
    const categoryStats = {};

    stats.map((player) => statCategoryList.map(cat => {
        player.firsts[cat] = player.firsts[cat] || 0;
        player.completions[cat] = player.completions[cat] || 0;
        
        categoryStats[cat] = categoryStats[cat] || {
            firsts: 0,
            completions: 0,
        };
        categoryStats[cat].firsts += player.firsts[cat];
        categoryStats[cat].completions += player.completions[cat];
    }));

    statCategoryList.map(cat => {
        sortFilterStats((a, b) => b.firsts[cat] - a.firsts[cat]);
        sortFilterStats((a, b) => b.completions[cat] - a.completions[cat]);
    });

    statCategoryList.sort((a, b) => categoryStats[b].completions - categoryStats[a].completions);

    const leaderboard = {
        "categories": statCategoryList,
        "players": stats.filter(player => inLeaderboard[player.name])
    };

    dataFilePath = path.join("data", "authors.json");
    fs.writeFileSync(dataFilePath, JSON.stringify(authors));
    console.log("Authors data updated");

    dataFilePath = path.join("data", "playernames.json");
    fs.writeFileSync(dataFilePath, JSON.stringify(playernames));
    console.log("Player names data updated");

    dataFilePath = path.join("data", "leaderboard.json");
    fs.writeFileSync(dataFilePath, JSON.stringify(leaderboard));
    console.log("Leaderboard data updated");
})();

