'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const fs = require('fs-extra')
const path = require('path')
const childProcess = require('child_process')

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')['path']
const electronIconMaker = require.resolve('electron-icon-maker')
const jsonfile = require('jsonfile')
const logger = require('@sidneys/logger')({ timestamp: false })
const releasenotes = require('@sidneys/releasenotes')
const parseFilepath = require('parse-filepath')


/**
 * Filesystem
 * @constant
 */
const graphicsDirectory = path.join(appRootPath, 'resources', 'graphics')
const iconsDirectory = path.join(appRootPath, 'icons')
const packageJsonFilePath = path.join(appRootPath, 'package.json')
const appiconFilePath = path.join(graphicsDirectory, 'appicon.png')

/**
 * Add new components to files/folder names and return the new path
 * @param {String} filePath - Filepath
 * @param {String} label - Added component label
 * @param {String=} separator - Component seperator
 * @returns {String} File path
 */
let extendPathname = (filePath = '', label, separator = '-') => {
    // Parse
    const parsed = parseFilepath(filePath)

    /**
     * Path Name: <directory>/<title>.<extension>
     */

    // Title
    let title = parsed.basename.replace(/\..+$/, '')

    if (label) {
        title += `${separator}${label}`
    }

    // Extension
    const extension = parsed.basename.replace(/^[^.]+/, '')

    // Pathh
    return path.join(parsed.dirname,`${title}${extension}`)
}

/**
 * Backup default Configuration
 */
let backupDefaultConfiguration = () => {
    logger.debug('backupDefaultConfiguration')

    // Status
    logger.info('backing up build settings', 'of project:', appRootPath)

    // DEBUG
    logger.debug('extendPathname(packageJsonFilePath, backup)', extendPathname(packageJsonFilePath, 'backup'))
    logger.debug('extendPathname(iconsDirectory, backup)', extendPathname(iconsDirectory, 'backup'))

    // Copy assets to backup locations
    fs.copySync(packageJsonFilePath, extendPathname(packageJsonFilePath, 'backup'), { overwrite: true })
    fs.copySync(iconsDirectory, extendPathname(iconsDirectory, 'backup'), { overwrite: true })
}

/**
 * Restore application configuration backup
 */
let restoreDefaultConfiguration = () => {
    logger.debug('restoreDefaultConfiguration')

    // Status
    logger.info('restoring build settings', 'to project:', appRootPath)

    // DEBUG
    logger.debug('extendPathname(packageJsonFilePath, backup)', extendPathname(packageJsonFilePath, 'backup'))
    logger.debug('extendPathname(iconsDirectory, backup)', extendPathname(iconsDirectory, 'backup'))

    // Move assets from backup locations
    fs.moveSync(extendPathname(packageJsonFilePath, 'backup'), packageJsonFilePath, { overwrite: true })
    fs.moveSync(extendPathname(iconsDirectory, 'backup'), iconsDirectory, { overwrite: true })
}

/**
 * Apply Build Flavors
 * @param {Array} flavorList - Selection of Build Flavors to apply
 * (Build Flavor: additive, temporary changes to application metadata during build-time)
 */
let applyBuildFlavors = (flavorList) => {
    logger.debug('applyBuildFlavors', 'flavorList:', ...flavorList)

    // Parse package.json
    const packageJsonCurrent = jsonfile.readFileSync(packageJsonFilePath)

    // Status
    logger.info('applying build configuration to application path:', appRootPath)

    for (const flavor of flavorList) {
        // Status
        logger.info('adding flavor:', flavor)

        // DEBUG
        logger.debug('[flavor]', flavor)
        logger.debug('[appiconFilePath]', extendPathname(appiconFilePath, flavor))

        if (!packageJsonCurrent.hasOwnProperty('build')) {
            packageJsonCurrent.build = {}
        }

        switch (flavor) {
            /**
             * FLAVOUR: preview
             */
            case 'preview':
                // CHANGE: electron-builder Build-Configuration Changes
                packageJsonCurrent.build.appId = `${packageJsonCurrent.build.appId}.preview`
                packageJsonCurrent.build.mac.hardenedRuntime = false
                packageJsonCurrent.build.compression = 'store'

                // CHANGE: electron Application Changes
                packageJsonCurrent.productName = `${packageJsonCurrent.productName} Preview`
                packageJsonCurrent.appId = packageJsonCurrent.build.appId

                break

                // CREATE: Icon Assets
                childProcess.spawnSync(electronIconMaker, [ '--input', extendPathname(appiconFilePath, flavor), '--output', appRootPath ])
            /**
             * FLAVOUR: production
             */
            case 'production':
                // CHANGE: electron-packager Release Info (latest.yml, latest-mac.yml)
                packageJsonCurrent.build.releaseInfo = {
                    releaseDate: new Date().toISOString(),
                    releaseName: `${packageJsonCurrent.productName} v${packageJsonCurrent.version}` || `${packageJsonCurrent.name} v${packageJsonCurrent.version}`,
                    releaseNotes: releasenotes.readAsMarkdown(packageJsonCurrent.version)
                }
        }
    }

    // Update package.json
    jsonfile.writeFileSync(packageJsonFilePath, packageJsonCurrent, { spaces: 2 })
}


/**
 * @exports
 */
module.exports = {
    applyBuildFlavors: applyBuildFlavors,
    backupDefaultConfiguration: backupDefaultConfiguration,
    restoreDefaultConfiguration: restoreDefaultConfiguration
}
