/**
 * Created by Denis on 13.09.2017.
 */
const fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path');
/**
 * Преобразование строки в ArrayBuffer
 * @param {string} str
 * @return {Uint8Array}
 */
function str2ab(str) {
    let buf = new ArrayBuffer(str.length); // 2 bytes for each char
    let bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return bufView;
};

/**
 * Сохранение файлов
 * @param {Array} files
 * @param {string} savePath
 * @param {string} pref
 * @param {Array} filteredExtensions
 * @return {Promise}
 */
async function saveFiles(files, savePath, pref = '', filteredExtensions) {
    return new Promise((r, rj) => {
        let globalPath = path.join(global.mainDir || __dirname, global.addFilePath);
        mkdirp(globalPath + '/' + savePath, 0o666, (err) => {
            if (err) rj(err);
            else {
                let promises = [];
                files.forEach(file => {
                    let ext = file.name.split('.', 2)[1], isSave = true;

                    if (filteredExtensions && filteredExtensions.length && filteredExtensions.indexOf(ext) == -1) isSave = false;

                    if (isSave) {
                        promises.push(new Promise((resolve, reject) => {
                            let url = savePath + '/' + pref + (new Date().getTime() * Math.random()) + '.' + ext,
                                writer = fs.createWriteStream(globalPath + '/' + url),
                                reader = fs.createReadStream(file.path);

                            writer.on('finish', () => {
                                resolve({name: file.name, url});
                            });
                            writer.on('error', (err) => {
                                reject(err);
                            });
                            reader.on('error', (err) => {
                                reject(err);
                            });

                            reader.pipe(writer);
                        }));
                    }
                });

                if (promises.length) {
                    Promise.all(promises).then((data) => {
                        r(data);
                    }).catch(err => rj(err));
                } else r(false);
            }
        });
    });
};

module.exports = {
    str2ab,
    saveFiles
};