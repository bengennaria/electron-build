'use strict'


/**
 * Modules
 * External
 * @constant
 */
const electronBuilder = require('electron-builder')
const logger = require('@sidneys/logger')({ timestamp: false })

/**
 * Modules
 * Internal
 * @constant
 */
const configureBuild = require('./configure')


/**
 * Build Target Platforms via electron-builder
 * @param {Array} platformList - Selection of Platforms to build
 * @param {Array} flavorList - Selection of Build Flavors to apply
 * @param {function=} callback - Completion callback
 */
let build = (platformList, flavorList, callback = () => {}) => {
    logger.debug('build', 'platforms:', ...platformList, 'flavors:', ...flavorList)

    // Create Set for syntactic sugar, deduplication
    const platformSet = new Set()

    // Coerce platform name variants ("windows", "macos", "linux")
    platformList.forEach(name => {
        name.startsWith('win') ? platformSet.add('windows') : void 0
        name.startsWith('mac') ? platformSet.add('macos') : void 0
        name.startsWith('darwin') ? platformSet.add('macos') : void 0
        name.startsWith('linux') ? platformSet.add('linux') : void 0
    })

    // Backup build configuration
    configureBuild.backupDefaultConfiguration()

    // Apply build flavors
    configureBuild.applyBuildFlavors(flavorList)

    // Status
    logger.info('build starting for platforms:', ...platformSet)

    // Call electron-builder.build(CliOptions)
    electronBuilder
        .build({
            ...platformSet.has('windows') && { 'win': [] },
            ...platformSet.has('macos') && { 'mac': [] },
            ...platformSet.has('linux') && { 'linux': [] },
            ia32: true,
            arm64: true,
            x64: true
        })
        .then(result => console.info(result))
        .catch(error => console.error(error))
        .finally(() => {
            // Status
            logger.info('completed build for all platforms')

            // Restore Configuration
            configureBuild.restoreDefaultConfiguration()

            // Callback
            callback()
        })
}


/**
 * @exports
 */
module.exports = build

