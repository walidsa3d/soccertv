/* 
 * @Author: walid
 * @Date:   2015-10-31 12:34:02
 * @Last Modified by:   walid
 * @Last Modified time: 2015-11-01 16:13:59
 */

var request = require('request-promise');
var cheerio = require('cheerio');
var chalk = require('chalk');
var Table = require('cli-table3');
var program = require('commander');

var url = 'http://www.getyourfixtures.com/all/fixtures/today/football';
program.version('0.0.1')
    .option('-to, --tomorrow', 'tomorrow matches')
    .parse(process.argv);
if (program.tomorrow)
    url = 'http://www.getyourfixtures.com/all/fixtures/tomorrow/football';

var options = {
    uri: url,
    transform: function(body) {
        return cheerio.load(body);
    }
};
request(options)
    .then(function($) {
        var table = new Table({
            head: ['Time', 'Home', 'Away', 'Competition', 'Channels']
        });
        $('.match').each(function(index, div) {
            if ($(div).find(".home").text() && $(div).find(".away").text()) {
                competition = $(div).find(".competition").eq(0).text().trim();
                time = $(div).find("div.time span").eq(0).text().trim();
                home = $(div).find("div.home").eq(0).text().trim();
                away = $(div).find("div.away").eq(0).text().trim();
                stations = $(div).find("div.stations ul li.country-qa");
                var nstations = [];
                $(stations).each(function(index, station) {
                    var stat = clean($(station).text());
                    stat = chalk.bgMagenta(stat);
                    nstations.push(stat);

                });
                if (nstations.length > 0)

                    table.push([chalk.bgYellow.red(time), chalk.cyan(home), chalk.red(away), chalk.green.bold(competition), nstations.join(' ')]);
            }
        });
        console.log(table.toString());

    }).catch(function(err) {
        console.log(err);
    });

var clean = function(channel_name) {
    var stop_words = ['Sports', 'Sport', 'Channel', 'Television', 'Arabia', 'TV'];
    var channel = channel_name;
    for (var i = 0; i < stop_words.length; i++) {
        var re = new RegExp("\s?" + stop_words[i] + "\s?", "gi");
        channel = channel.replace(re, '');
    }
    return channel.trim();
};