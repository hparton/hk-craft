var AdmZip = require('adm-zip');
var fs = require('fs-extra');
var request = require('request');
var ProgressBar = require('progress');
var ncp = require('ncp').ncp;

// TODO: add option to edit db.php file to work on newer version of SQL
// TODO: add option to specify what version to install

function buildCraft() {
    var bar;
    request('http://craftcms.com/latest.zip?accept_license=yes')
    .on('response', function(res){
        var len = parseInt(res.headers['content-length'], 10);
        bar = new ProgressBar('~ '.yellow + '[:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: len
        });
    })
    .on('data', function(chunk){
        bar.tick(chunk.length);
    })
    .pipe(fs.createWriteStream('craft.zip'))
    .on('open', function () {
        console.log('~ '.yellow + 'Downloading latest version...');
    })
    .on('close', function () {
        console.log('~ '.yellow + 'Finished downloading, extracting...');

        var zip = new AdmZip('craft.zip');
        zip.extractAllTo("./", true);

        ncp('./craft', './', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log('~ '.yellow + 'Done, cleaning up temp files...');

            fs.remove('./craft.zip', function (err) {
              if (err) return console.error(err)
            });
            fs.remove('./craft', function (err) {
              if (err) return console.error(err)
            });

            console.log('✔ '.green + 'Done!');
        });
    });
}

module.exports = buildCraft;